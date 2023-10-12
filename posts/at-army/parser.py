from datetime import datetime


def parse_timestr(timestr):
    date, time = timestr.split('$')
    date = date.strip()
    time = time.strip()

    year, month, day = date.split('-')
    hour, minute, second = time.split(':')

    year = int(year)
    month = int(month)
    day = int(day)
    hour = int(hour)
    minute = int(minute)
    second = int(second)

    return datetime(year, month, day, hour, minute, second)


with open('packet.bin', 'r') as f:
    data = f.read()

data = data.replace('.', '')
data = data.split('<//>')

# Filter empty rows
data = list(filter(lambda x: x != '', data))

minute_sum = 0
for row in data:
    row = row.split('<&&>')
    uid, username, start_time, end_time, minute = row
    minute = int(minute)
    start_time = parse_timestr(start_time)
    end_time = parse_timestr(end_time)

    row = [uid, username, start_time, end_time, minute]

    minute_sum += minute
    print(row)

print('rows:', len(data))
print('minute_sum:', minute_sum)
print('hour_sum:', minute_sum/60)
