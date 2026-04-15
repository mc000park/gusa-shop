const Footer = () => {
  return (
    <footer className="footer-wrap">
      <div className="footer-top">
        <div className="footer-grid">
          {/* 브랜드 */}
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#fff',
                marginBottom: 12,
                letterSpacing: '-0.5px',
              }}
            >
              GUSA
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, margin: '0 0 16px' }}>
              초·중·고 교재 전문 쇼핑몰
              <br />
              검증된 교재로 학생들의
              <br />
              성장을 응원합니다.
            </p>
          </div>

          {/* 교재 카테고리 */}
          <div>
            <h4
              style={{
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                margin: '0 0 16px',
              }}
            >
              교재 카테고리
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {[
                '초등 교재',
                '중등 교재',
                '고등 교재',
                '수능 대비',
                '학습 교구',
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      color: '#94a3b8',
                      textDecoration: 'none',
                      fontSize: 13,
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h4
              style={{
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                margin: '0 0 16px',
              }}
            >
              고객 지원
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {[
                '공지사항',
                '자주 묻는 질문',
                '1:1 문의',
                '교환·반품 안내',
                '배송 안내',
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      color: '#94a3b8',
                      textDecoration: 'none',
                      fontSize: 13,
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객센터 */}
          <div>
            <h4
              style={{
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                margin: '0 0 16px',
              }}
            >
              고객센터
            </h4>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: '#3b82f6',
                marginBottom: 6,
              }}
            >
              1588-0000
            </div>
            <p style={{ fontSize: 12, margin: '0 0 16px', lineHeight: 1.8 }}>
              평일 09:00 ~ 18:00
              <br />
              점심 12:00 ~ 13:00 제외
              <br />
              주말 및 공휴일 휴무
            </p>
            <div
              style={{
                background: '#1a56db',
                color: '#fff',
                display: 'inline-block',
                padding: '8px 20px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              1:1 문의하기
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <div style={{ fontSize: 12, lineHeight: 1.8 }}>
            <span style={{ color: '#fff', fontWeight: 600 }}>㈜구사교재</span>
            {'  '}대표이사 홍길동{'  '}|{'  '}사업자등록번호 123-45-67890
            {'  '}|{'  '}통신판매업신고 제2026-서울강남-0001호
            <br />
            서울특별시 강남구 테헤란로 123, 5층{'  '}|{'  '}이메일
            help@gusa.co.kr
          </div>
          <div style={{ fontSize: 12 }}>
            <a
              href="#"
              style={{
                color: '#94a3b8',
                textDecoration: 'none',
                marginRight: 16,
              }}
            >
              이용약관
            </a>
            <a
              href="#"
              style={{
                color: '#e2e8f0',
                textDecoration: 'none',
                fontWeight: 600,
                marginRight: 16,
              }}
            >
              개인정보처리방침
            </a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              이용안내
            </a>
          </div>
        </div>
        <div className="footer-copyright">
          © 2026 GUSA. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
