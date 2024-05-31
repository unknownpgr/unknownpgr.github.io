import cv2
import numpy as np
import matplotlib.pyplot as plt
import json
import os

VIDEO_NAME = 'input.mp4'
CONTOUR_JSON_NAME = 'contours.json'
NORMALIZED_CONTOURS_NAME = 'normalized_contours.npy'
FRAME_CURVE_COUNT_NAME = 'frame_curve_count.npy'


def get_contours():
    cap = cv2.VideoCapture(VIDEO_NAME)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    if not cap.isOpened():
        print('Error: Cannot open video')
        exit()

    frames = []
    i = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Print progress
        print(f'Frame {i}')
        i += 1

        # Frame binarization
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

        # Find contours
        contours, _ = cv2.findContours(
            binary,
            cv2.RETR_TREE,
            cv2.CHAIN_APPROX_SIMPLE
        )

        curves = []
        for contour in contours:
            array = np.array(contour)
            # Add last point to close the curve
            array = np.append(array, array[0])
            array = array.reshape(-1, 2)
            array = array.tolist()
            curves.append(array)
        frames.append(curves)

    cap.release()
    json.dump(frames, open(CONTOUR_JSON_NAME, 'w'))


def normalize_curve(complex_points, n_points=1000):
    '''
    Normalize curve to function of its length
    '''
    lengths = np.cumsum(np.abs(np.diff(complex_points)))
    lengths = np.insert(lengths, 0, 0)
    total_length = lengths[-1]
    normalized = []
    for i in range(n_points):
        current_length = total_length * i / (n_points - 1)
        for j in range(1, len(complex_points)):
            if lengths[j] >= current_length:
                break
        a = complex_points[j - 1]
        b = complex_points[j]
        da = lengths[j - 1]
        db = lengths[j]
        if db == da:
            t = 0
        else:
            t = (current_length - da) / (db - da)
        normalized.append(a + t * (b - a))

    return normalized


def normalize_contours(n_points=1000):
    contours = json.load(open(CONTOUR_JSON_NAME))
    frame_curve_count = []
    normalized_curves = []
    for i, curves in enumerate(contours):
        print(f'Frame {i} ({i/len(contours)*100:.2f}%)')
        curve_count = 0
        for j, curve in enumerate(curves):
            if len(curve) < 2:
                continue
            complexes = [complex(x[0], x[1]) for x in curve]
            new_curve = normalize_curve(complexes, n_points)
            normalized_curves.append(new_curve)
            curve_count += 1
        frame_curve_count.append(curve_count)
    normalized_curves = np.array(normalized_curves)
    print(normalized_curves.shape)
    np.save('normalized_contours.npy', normalized_curves)
    np.save('frame_curve_count.npy', frame_curve_count)


def draw_frame():
    contours = np.load(NORMALIZED_CONTOURS_NAME)
    print(contours.shape)
    frame_curve_count = np.load(FRAME_CURVE_COUNT_NAME)
    os.makedirs('plots', exist_ok=True)

    # Define low-pass filter
    curve_length = contours.shape[1]
    cutoff_range = 0.7
    cutoff_start = int(curve_length * (1 - cutoff_range)/2)
    cutoff_end = int(curve_length * (1 + cutoff_range)/2)

    # FFT each curve
    fourier = np.fft.fft(contours)

    # Apply low-pass filter
    fourier[:, cutoff_start:cutoff_end] = 0

    # Inverse FFT
    iff = np.fft.ifft(fourier)

    # Take conjugate to flip the image
    iff = np.conj(iff)

    # Find min, max coordinates
    min_x = np.min(iff.real)
    max_x = np.max(iff.real)
    min_y = np.min(iff.imag)
    max_y = np.max(iff.imag)

    # Draw each frame
    start_curve_index = 0
    for i, curve_count in enumerate(frame_curve_count):
        print(f'Frame {i} ({i/len(frame_curve_count)*100:.2f}%)')
        # Draw curves
        plt.xlim(min_x, max_x)
        plt.ylim(min_y, max_y)
        for j in range(curve_count):
            curve = iff[start_curve_index + j]
            plt.plot(curve.real, curve.imag)
        plt.savefig(f'plots/{i}.png')
        plt.close()
        start_curve_index += curve_count


def graph_to_video():
    figure_image = cv2.imread('plots/0.png')
    height, width = figure_image.shape[:2]
    out = cv2.VideoWriter(
        'output.mp4',
        cv2.VideoWriter_fourcc(*'mp4v'),
        30,
        (width, height)
    )
    for i in range(0, 10000):
        print(f'Frame {i}')
        img = cv2.imread(f'plots/{i}.png')
        if img is None:
            break
        out.write(img)
    out.release()


def add_audio():
    # User ffmpeg to add audio
    os.system(
        'ffmpeg -i output.mp4 -i input.mp4 -c:v copy -c:a aac -strict experimental -vcodec libx264 -crf 23 output_with_audio.mp4')


# get_contours()
# normalize_contours()
# draw_frame()
# graph_to_video()
add_audio()
