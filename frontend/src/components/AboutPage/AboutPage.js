import React from "react";
import "./aboutPage.scss";

function Emoji(props) {
  return <span role="img" aria-label="emoji">{props.emoji}</span>;
}

function Ank(props) {
  return <a href={props.href} target='_blank' rel="noopener noreferrer" className="url">{props.children}</a>;
}

function ProjectItem({ link, title, descriptions }) {
  return <li className="project-item">
    <p><Ank href={link}>{title}</Ank></p>
    <ul>
      {descriptions.map((text, i) => <li key={i}>{text}</li>)}
    </ul>
  </li>;
}

function ProjectGroup({ children, label }) {
  return <div className="project-group">
    <div className="group-title">{children}</div>
    <div className="group-label">{label}</div>
  </div>;
}

function AboutPage(props) {
  return <div className="container aboutpage">
    <h1>저는요 - About UnknownPgr. <Emoji emoji='😀' /></h1>
    <ul>
      <li>항상 새로운 분야에 도전합니다.</li>
      <li>컴퓨터를 다른 분야에 적용해 새로운 가치를 이끌어내는 것이 제 목표입니다.</li>
      <li>웹, 임베디드, 그래픽스, 머신러닝, 수치해석 등 다양한 분야를 폭넓게 공부해보고 있습니다.</li>
      <li>그 중에서도 <strong>웹과 임베디드</strong>를 주로 공부하고 있습니다.</li>
    </ul>
    <h2>Selected Projects <Emoji emoji='🧾' /></h2>
    <ul>
      <ProjectGroup >Web</ProjectGroup>
      <ProjectItem
        link='https://github.com/unknownpgr/github-blog'
        title='깃허브 블로그'
        descriptions={[
          'Jekyll, Hexo 등 기존에 있는 프레임워크를 사용하지 않고 바닥에서부터 블로그를 만들어봤습니다.',
          'React / SCSS 등 UI 프레임워크, GitHub Action을 사용한 간단한 CI/CD 등 웹 개발을 위한 기초 기술들을 많이 사용해봤습니다.'
        ]} />
      <ProjectItem
        link='https://github.com/unknownpgr/uos-urban'
        title='토공 다짐도 자동화시스템'
        descriptions={[
          '서울시립대학교 국제도시과학대학원에서 학생연구원으로서 진행한 프로젝트입니다.',
          '현장에서 사용하는 장비에서 서버로 데이터 전송, 서버에서 DB에 데이터 저장 및 웹 페이지를 통한 시각화까지 구현했습니다.',
        ]} />
      <ProjectGroup>Embedded</ProjectGroup>
      <ProjectItem
        link='https://github.com/shythm/eswcontest-car'
        title='임베디드소프트웨어 경진대회'
        descriptions={[
          '카메라 및 각종 센서가 장치된 임베디드 리눅스 기반의 차량을 자율주행시키는 대회에 참여하였습니다.',
          '임베디드시스템에서의 영상처리, 실시간 제어를 위한 최적화 등을 수행해볼 수 있는 기회였습니다.',
        ]} />
      <ProjectItem
        link='https://github.com/unknownpgr/trashcan'
        title='자율주행 쓰레기통(?)'
        descriptions={[
          '라즈베리파이를 이용하여 바닥에 그려진 경로를 따라 주행하고, 자동으로 최단거리탐색을 수행하는 쓰레기통을 만들었습니다.',
          'Memory mapped IO, CPU affinity등 다양한 리눅스 커널 기능을 이용해본 프로젝트였습니다.',
        ]} />
      <ProjectItem
        link='https://github.com/unknownpgr/zetin-linetracer-custom'
        title='라인트레이서'
        descriptions={[
          '로봇 동아리 ZETIN에서 STM32F407 MCU를 사용하여 라인트레이서를 제작하였습니다.',
          'Interrupt, Register 등 임베디드시스템에 대한 근본적인 이해를 할 수 있도록 해 준 프로젝트였습니다.',
        ]} />
      <ProjectGroup>Graphics</ProjectGroup>
      <ProjectItem
        link='https://github.com/unknownpgr/auto-projection-matching'
        title='Reverse Projection-1'
        descriptions={[
          '왜곡된 영상을 비스듬한 각도에서도 정상적으로 볼 수 있도록 프로젝션해주는 프로그램입니다.',
          'Python+OpenCV를 사용하여 구현하였으며, 2019년 셈틀제에서 5등상을 수상했습니다.'
        ]} />
      <ProjectItem
        link='https://github.com/unknownpgr/auto-projection-matching-2'
        title='Reverse Projection-2'
        descriptions={[
          'Reverse Projection-1을 움직이는 관찰자 입장에서도 사용할 수 있고, 3D 모델에 대해서도 적용할 수 있도록 확장한 것입니다.',
          'WebGL의 Shader를 직접 작성하고 사용해볼 수 있는 기회였습니다.',
          '2020년 셈틀제에서 2등상을 수상했습니다.',
        ]} />
      <ProjectItem
        link='https://github.com/unknownpgr/road-simulator'
        title='도로 시뮬레이터'
        descriptions={[
          '임베디드 경진대회에서 머신러닝을 통한 차선 인식을 구현하고자, 데이터셋 생성 목적으로 도로 시뮬레이터를 만들었습니다.',
        ]} />
      <ProjectGroup>Numerical analysis</ProjectGroup>
      <ProjectItem
        link='https://github.com/unknownpgr/lagrangian-mechanics'
        title='라그랑주 역학 시뮬레이터'
        descriptions={[
          '어떤 역학계의 운동에너지와 위치에너지로부터 라그랑지안을 계산하고, 각 일반화 좌표에 대해 푸는 MATLAB 스크립트입니다.',
          '추가로 JS 에서explicit Euler method를 사용하여 시뮬레이션을 만들어봤습니다.',
        ]} />
      <ProjectItem
        link='https://github.com/unknownpgr/fourier_transform'
        title='이산 푸리에 변환'
        descriptions={[
          '주어진 곡선을 이산 푸리에 변환(DFT)을 이용하여 연속적인 곡선으로 변환해주는 C# 프로그램입니다.',
          '지금 보기에는 조악한 구현이지만, 고등학생 때 구현했다는 것에 의의를 두겠습니다.',
        ]} />
      <ProjectGroup>AI</ProjectGroup>
      <ProjectItem
        link='https://github.com/unknownpgr/face_recognize'
        title='Face Tracking'
        descriptions={[
          'OpenFace 라이브러리 및 SVM을 이용하여 얼굴 인식과 트래킹을 수행하도록 구현해봤습니다.',
        ]} />
      <ProjectGroup label="인생은 즐겁게.">Fun projects</ProjectGroup>
      <ProjectItem
        link='https://github.com/unknownpgr/t-png'
        title='t-png'
        descriptions={[
          '배경색에 따라 서로 다른 이미지로 보이는 png이미지를 자동 생성하는 python/js 스크립트입니다.',
          'PseudoInverse 등 선형대수 연산을 사용했습니다.'
        ]} />
      <ProjectItem
        link='https://github.com/unknownpgr/boolean-bruteforece'
        title='Boolean Bruteforce'
        descriptions={[
          '주어진 truth-table을 만족시키는 가장 짧은 단일 boolean expression을 찾는 C++ 프로그램입니다.'
        ]} />
      <ProjectItem
        link='https://github.com/unknownpgr/fractal-js'
        title='Mandelbrot Set'
        descriptions={[
          '프랙탈의 한 종류인 Mandelbrot Set을 순수 js와 WebGL을 사용하여 그려봤습니다.'
        ]}
      />
      <ProjectItem
        link='https://github.com/unknownpgr/dragon-curve'
        title='Dragon Curve'
        descriptions={[
          '프랙탈의 한 종류인 dragon curve를 그려봤습니다.'
        ]} />
    </ul>
    <h2>Work Experiences <Emoji emoji='👨‍💻' /></h2>
    <ul>
      <li>
        <p>Undergraduate Research Intern, University of Seoul</p>
        <ul>
          <li>Human-Centered Artificial Intelligence Lab(HCAIL) Supervisor: Prof. Hyunggu Jung
              </li>
        </ul>
      </li>
      <li>
        <p>Teaching Assistant, University of Seoul</p>
        <ul>
          <li>C Programming and Practice, 2019 Winter Semister</li>
        </ul>
      </li>
    </ul>
    <h2>Honors / Awards <Emoji emoji='🏅' /></h2>
    <ul>
      <li>
        <p>서울시립대학교 2020년 X-TWICE 실전문제연구단 장려상</p>
        <ul>
          <li>딥러닝 기반 연관논문 추천시스템 개발 및 평가</li>
        </ul>
      </li>
      <li>
        <p>서울시립대학교 2020년 셈틀제 2등</p>
      </li>
      <li>
        <p>서울시립대학교 2019년 셈틀제 5등</p>
      </li>
      <li>
        <p>성균관대학교 2019 전국 대학생 자율주행차 융합설계 경진대회 최우수상(주행 부문)</p>
      </li>
      <li>
        <p>서울시립대학교 2019 제3회 컴퓨터알고리즘 프로그래밍 경진대회 장려상</p>
      </li>
      <li>
        <p>서울시립대학교 2019 제22회 전국 라인트레이서 로봇 경연대회 장려상</p>
      </li>
      <li>
        <p>입학우수장학 (2019년 1학기)</p>
      </li>
      <li>
        <p>국가장학 I (2019년 1학기~2020년 2학기)</p>
      </li>
      <li>
        <p>학업우수장학(II) (2019년 2학기~2020년 2학기)</p>
      </li>
    </ul>
    <h2>Publications <Emoji emoji='📔' /></h2>
    <ul>
      <li>
        <p>
          <strong>Gwon, J</strong>., Kwon, M., &amp; Jung, H. (2020, April). Analyzing Bias of Comments on Political News Articles to Facilitate Transparent Online Communities. In Proceedings of the 2020 Symposium on Emerging Research from Asia and on Asian Contexts and Cultures (pp. 49-52).
        </p>
        <ul>
          <li><Ank href='https://dl.acm.org/profile/99659569708'>https://dl.acm.org/profile/99659569708</Ank></li>
        </ul>
      </li>
      <li>
        <p>
          Lee, W., Kwon, M., Hyun, Y., Lee, J., <strong>Gwon, J</strong>., & Jung, H. (2020, April). Uncovering CHI Reviewers Needs and Barriers. In Proceedings of the 2020 Symposium on Emerging Research from Asia and on Asian Contexts and Cultures (pp. 57-60).
        </p>
        <ul>
          <li>
            <Ank href='https://dl.acm.org/doi/abs/10.1145/3391203.3391218'>https://dl.acm.org/doi/abs/10.1145/3391203.3391218</Ank>
          </li>
        </ul>
      </li>
    </ul>
    <h2>Contact <Emoji emoji='📞' /></h2>
    <ul>
      <li><Emoji emoji='🏡'></Emoji> Korea / Seoul</li>
      <li><Emoji emoji="📧"></Emoji> unknownpgr@gmail.com</li>
      <li><Emoji emoji="🐙"></Emoji> <Ank href='https://github.com/unknownpgr'> https://github.com/unknownpgr </Ank></li>
    </ul>
  </div>;
}

export default AboutPage;
