import React, { ReactNode } from "react";

import styles from "../styles/about.module.css";

function Ank({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="url">
      {children}
    </a>
  );
}

function ProjectItem({
  link,
  title,
  descriptions,
}: {
  link: string;
  title: string;
  descriptions: string[];
}) {
  return (
    <li>
      <div className={styles.itemTitle}>
        <Ank href={link}>{title}</Ank>
      </div>
      <ul>
        {descriptions.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
    </li>
  );
}

function ProjectGroup({ children }: { children: ReactNode }) {
  return <h1 className={styles.projectGroup}>{children}</h1>;
}

function AboutPage() {
  return (
    <div className={styles.about}>
      <h1>About UnknownPgr.</h1>
      <ul>
        <li>항상 새로운 분야에 도전합니다.</li>
        <li>
          컴퓨터를 다른 분야에 적용해 새로운 가치를 이끌어내는 것이 제
          목표입니다.
        </li>
        <li>
          웹, 임베디드, 그래픽스, 머신러닝, 수치해석 등 다양한 분야를 폭넓게
          공부해보고 있습니다.
        </li>
        <li>
          그 중에서도 <strong>웹과 임베디드</strong>를 주로 공부하고 있습니다.
        </li>
      </ul>
      <h2>Contact</h2>
      <ul>
        <li>Location : Korea / Seoul</li>
        <li>
          Email :{" "}
          <Ank href="mailto:unknownpgr@gmail.com">unknownpgr@gmail.com</Ank>
        </li>
        <li>
          GitHub :{" "}
          <Ank href="https://github.com/unknownpgr">github.com/unknownpgr</Ank>
        </li>
      </ul>
      <h2>Selected Projects</h2>
      <ul>
        <ProjectGroup>Services</ProjectGroup>
        <ProjectItem
          link="https://the-form.io"
          title="The Form"
          descriptions={[
            "더폼은 웹에서 간편하게 설문조사를 만들고, 응답을 수집할 수 있는 서비스입니다.",
            "평균 1만, 최대 10만 정도의 MAU를 보유하고 있습니다.",
            "CTO Role을 맡아서 서비스 전반을 관리하고 있습니다.",
          ]}
        ></ProjectItem>
        <ProjectItem
          link="https://real-estate.unknownpgr.com"
          title="Real Estate Manager"
          descriptions={[
            "부동산 중개인(공인중개사)가 부동산 매물을 관리할 수 있는 웹 서비스입니다.",
            "현재는 홍보 없이 beta 버전으로 운영 중이나, 회원 가입 및 서비스 사용은 가능합니다.",
            "1인 개발 프로젝트로, 서비스 아키텍쳐 및 인프라 설계부터 개발, 배포까지 전반적으로 진행하고 있습니다.",
          ]}
        ></ProjectItem>
        <ProjectGroup>Web</ProjectGroup>
        <ProjectItem
          link="https://www.npmjs.com/package/@unknownpgr/git-key"
          title="Git-Key"
          descriptions={[
            "An open source library for safely managing secrets with git.",
            "My first open source library project.",
          ]}
        />
        <ProjectItem
          link="https://pabnft.com"
          title="PAB-NFT"
          descriptions={[
            "Pixel Art Board (PAB) is a web3 project that allows users to create and trade NFTs.",
            "Based on ERC-721, Solidity, Web3 and React.",
          ]}
        ></ProjectItem>
        <ProjectItem
          link="https://github.com/unknownpgr/github-blog"
          title="깃허브 블로그"
          descriptions={[
            "Jekyll, Hexo 등 기존에 있는 프레임워크를 사용하지 않고 바닥에서부터 블로그를 만들어봤습니다.",
            "React / SCSS 등 UI 프레임워크, GitHub Action을 사용한 간단한 CI/CD 등 웹 개발을 위한 기초 기술들을 많이 사용해봤습니다.",
          ]}
        />
        <ProjectItem
          link="https://github.com/unknownpgr/uos-urban"
          title="토공 다짐도 자동화시스템"
          descriptions={[
            "서울시립대학교 국제도시과학대학원에서 학생연구원으로서 진행한 프로젝트입니다.",
            "현장에서 사용하는 장비에서 서버로 데이터 전송, 서버에서 DB에 데이터 저장 및 웹 페이지를 통한 시각화까지 구현했습니다.",
          ]}
        />
        <ProjectGroup>Embedded</ProjectGroup>
        <ProjectItem
          link="https://github.com/shythm/eswcontest-car"
          title="임베디드소프트웨어 경진대회"
          descriptions={[
            "카메라 및 각종 센서가 장치된 임베디드 리눅스 기반의 차량을 자율주행시키는 대회에 참여하였습니다.",
            "임베디드시스템에서의 영상처리, 실시간 제어를 위한 최적화 등을 수행해볼 수 있는 기회였습니다.",
          ]}
        />
        <ProjectItem
          link="https://github.com/unknownpgr/trashcan"
          title="자율주행 쓰레기통(?)"
          descriptions={[
            "라즈베리파이를 이용하여 바닥에 그려진 경로를 따라 주행하고, 자동으로 최단거리탐색을 수행하는 쓰레기통을 만들었습니다.",
            "Memory mapped IO, CPU affinity등 다양한 리눅스 커널 기능을 이용해본 프로젝트였습니다.",
          ]}
        />
        <ProjectItem
          link="https://github.com/unknownpgr/zetin-linetracer-custom"
          title="라인트레이서"
          descriptions={[
            "로봇 동아리 ZETIN에서 STM32F407 MCU를 사용하여 라인트레이서를 제작하였습니다.",
            "Interrupt, Register 등 임베디드시스템에 대한 근본적인 이해를 할 수 있도록 해 준 프로젝트였습니다.",
          ]}
        />
        <ProjectGroup>Graphics</ProjectGroup>
        <ProjectItem
          link="https://github.com/unknownpgr/auto-projection-matching"
          title="Reverse Projection-1"
          descriptions={[
            "왜곡된 영상을 비스듬한 각도에서도 정상적으로 볼 수 있도록 프로젝션해주는 프로그램입니다.",
            "Python+OpenCV를 사용하여 구현하였으며, 2019년 셈틀제에서 5등상을 수상했습니다.",
          ]}
        />
        <ProjectItem
          link="https://github.com/unknownpgr/auto-projection-matching-2"
          title="Reverse Projection-2"
          descriptions={[
            "Reverse Projection-1을 움직이는 관찰자 입장에서도 사용할 수 있고, 3D 모델에 대해서도 적용할 수 있도록 확장한 것입니다.",
            "WebGL의 Shader를 직접 작성하고 사용해볼 수 있는 기회였습니다.",
            "2020년 셈틀제에서 2등상을 수상했습니다.",
          ]}
        />
        <ProjectItem
          link="https://github.com/unknownpgr/road-simulator"
          title="도로 시뮬레이터"
          descriptions={[
            "임베디드 경진대회에서 머신러닝을 통한 차선 인식을 구현하고자, 데이터셋 생성 목적으로 도로 시뮬레이터를 만들었습니다.",
          ]}
        />
        <ProjectGroup>Numerical analysis</ProjectGroup>
        <ProjectItem
          link="https://github.com/unknownpgr/lagrangian-mechanics"
          title="라그랑주 역학 시뮬레이터"
          descriptions={[
            "어떤 역학계의 운동에너지와 위치에너지로부터 라그랑지안을 계산하고, 각 일반화 좌표에 대해 푸는 MATLAB 스크립트입니다.",
            "추가로 JS 에서explicit Euler method를 사용하여 시뮬레이션을 만들어봤습니다.",
          ]}
        />
        <ProjectGroup>Artificial Intelligence</ProjectGroup>
        <ProjectItem
          link="https://github.com/unknownpgr/face_recognize"
          title="Face Tracking"
          descriptions={[
            "OpenFace 라이브러리 및 SVM을 이용하여 얼굴 인식과 트래킹을 수행하도록 구현해봤습니다.",
          ]}
        />
        <ProjectGroup>Fun projects</ProjectGroup>
        <ProjectItem
          link="https://github.com/unknownpgr/t-png"
          title="t-png"
          descriptions={[
            "배경색에 따라 서로 다른 이미지로 보이는 png이미지를 자동 생성하는 python/js 스크립트입니다.",
            "PseudoInverse 등 선형대수 연산을 사용했습니다.",
          ]}
        />
        <ProjectItem
          link="https://github.com/unknownpgr/fractal-js"
          title="Mandelbrot Set"
          descriptions={[
            "프랙탈의 한 종류인 Mandelbrot Set을 순수 js와 WebGL을 사용하여 그려봤습니다.",
          ]}
        />
        <ProjectItem
          link="https://github.com/unknownpgr/dragon-curve"
          title="Dragon Curve"
          descriptions={["프랙탈의 한 종류인 dragon curve를 그려봤습니다."]}
        />
      </ul>
      <h2>Experiences</h2>
      <ul className={styles.spacedList}>
        <li>
          Software Maestro 12기
          <ul>
            <li>
              <a href="https://the-form.io">The-Form</a>
            </li>
          </ul>
        </li>
        <li>
          서울시립대학교 중앙동아리, 로봇연구회 ZETIN 회장
          <ul>
            <li>
              <a href="https://zetin.uos.ac.kr">https://zetin.uos.ac.kr</a>
            </li>
            <li>2020년 12월 ~ 2021년 12월</li>
          </ul>
        </li>
        <li>
          Undergraduate Research Intern, University of Seoul
          <ul>
            <li>Human-Centered Artificial Intelligence Lab(HCAIL)</li>
            <li>Supervisor: Prof. Hyunggu Jung</li>
          </ul>
        </li>
        <li>
          Undergraduate Research Intern, University of Seoul
          <ul>
            <li>International School of Urban Sciences</li>
            <li>Supervisor: Prof. Chun Ho Yeom</li>
          </ul>
        </li>
        <li>
          Teaching Assistant, University of Seoul
          <ul>
            <li>C Programming and Practice, 2019 Winter Semester</li>
          </ul>
        </li>
      </ul>
      <h2>Honors / Awards</h2>
      <ul className={styles.spacedList}>
        <li>
          2022년 제 8회 육군창업경진대회 창의상
          <ul>
            <li>부동산 등기 자동 검증 솔루션</li>
          </ul>
        </li>
        <li>2022년 육군 정보통신학교 전술 C4I 교육과정 최우수 수료</li>
        <li>2021년 소프트웨어 마에스트로 인증</li>
        <li>2020년 2학기 학업우수상</li>
        <li>
          서울시립대학교 2020년 X-TWICE 실전문제연구단 장려상
          <ul>
            <li>딥러닝 기반 연관논문 추천시스템 개발 및 평가</li>
          </ul>
        </li>
        <li>서울시립대학교 2020년 셈틀제 2등</li>
        <li>서울시립대학교 2019년 셈틀제 5등</li>
        <li>
          성균관대학교 2019 전국 대학생 자율주행차 융합설계 경진대회
          최우수상(주행 부문)
        </li>
        <li>
          서울시립대학교 2019 제3회 컴퓨터알고리즘 프로그래밍 경진대회 장려상
        </li>
        <li>
          서울시립대학교 2019 제22회 전국 라인트레이서 로봇 경연대회 장려상
        </li>
        <li>입학우수장학 (2019년 1학기)</li>
        <li>국가장학 I (2019년 1학기~2020년 2학기)</li>
        <li>학업우수장학(II) (2019년 2학기~2020년 2학기)</li>
      </ul>
      <h2>Publications</h2>
      <ul className={styles.spacedList}>
        <li>
          Lee, J., Gwak, S., <strong>Gwon, J</strong>., Park, J., Eom, S., Hong,
          S., ... & Jung, H. (2022). Exploring the community of older adult
          viewers on YouTube. Universal Access in the Information Society, 1-12.
          <ul>
            <li>
              <Ank href="https://link.springer.com/article/10.1007/s10209-022-00918-3">
                https://link.springer.com/article/10.1007/s10209-022-00918-3
              </Ank>
            </li>
          </ul>
        </li>
        <li>
          <strong>Gwon, J</strong>., Jun, Y., & Yeom, C. (2022). Integration of
          Dynamic Road Environmental Data for the Creation of Driving Simulator
          Scenarios. Journal of the Korea Institute of Information and
          Communication Engineering, 26(2), 278-287.
          <ul>
            <li>
              <Ank href="https://koreascience.kr/article/JAKO202209833893350.view?orgId=anpor&hide=breadcrumb,journalinfo">
                https://koreascience.kr/article/JAKO202209833893350.view?orgId=anpor&hide=breadcrumb,journalinfo
              </Ank>
            </li>
          </ul>
        </li>
        <li>
          <strong>Gwon, J</strong>., Kwon, M., &amp; Jung, H. (2020, April).
          Analyzing Bias of Comments on Political News Articles to Facilitate
          Transparent Online Communities. In Proceedings of the 2020 Symposium
          on Emerging Research from Asia and on Asian Contexts and Cultures (pp.
          49-52).
          <ul>
            <li>
              <Ank href="https://dl.acm.org/profile/99659569708">
                https://dl.acm.org/profile/99659569708
              </Ank>
            </li>
          </ul>
        </li>
        <li>
          Lee, W., Kwon, M., Hyun, Y., Lee, J., <strong>Gwon, J</strong>., &
          Jung, H. (2020, April). Uncovering CHI Reviewers Needs and Barriers.
          In Proceedings of the 2020 Symposium on Emerging Research from Asia
          and on Asian Contexts and Cultures (pp. 57-60).
          <ul>
            <li>
              <Ank href="https://dl.acm.org/doi/abs/10.1145/3391203.3391218">
                https://dl.acm.org/doi/abs/10.1145/3391203.3391218
              </Ank>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
}

export default AboutPage;
