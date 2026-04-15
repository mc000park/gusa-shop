package com.gusa.apex.global.config;

import com.gusa.apex.domain.order.dto.OrderCreateRequest;
import com.gusa.apex.domain.order.dto.OrderItemRequest;
import com.gusa.apex.domain.order.dto.OrderResponse;
import com.gusa.apex.domain.order.repository.OrderRepository;
import com.gusa.apex.domain.order.service.OrderService;
import com.gusa.apex.domain.product.entity.Product;
import com.gusa.apex.domain.product.repository.ProductRepository;
import com.gusa.apex.domain.user.entity.User;
import com.gusa.apex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Override
    public void run(ApplicationArguments args) {
        createAdminIfAbsent();
        createUserIfAbsent();
        createSampleMembersIfAbsent();
        createProductsIfAbsent();
        createOrdersIfAbsent();
    }

    private void createAdminIfAbsent() {
        if (userRepository.existsByUserId("admin")) {
            log.info("[DataInitializer] 관리자 계정이 이미 존재합니다.");
            return;
        }

        User admin = User.builder()
                .userId("admin")
                .password(passwordEncoder.encode("admin1234"))
                .userName("관리자")
                .email("admin@gusa.com")
                .phoneNumber("01000000000")
                .zipCode("00000")
                .address("서울시 관리자구")
                .addressDetail("관리자동 1호")
                .role("ROLE_ADMIN")
                .build();

        userRepository.save(admin);
        log.info("[DataInitializer] 관리자 계정 생성 완료 — ID: admin / PW: admin1234");
    }

    private void createUserIfAbsent() {
        if (userRepository.existsByUserId("test")) {
            log.info("[DataInitializer] 테스트 계정이 이미 존재합니다.");
            return;
        }

        User admin = User.builder()
                .userId("test")
                .password(passwordEncoder.encode("test1234"))
                .userName("사용자")
                .email("test@gusa.com")
                .phoneNumber("01011111111")
                .zipCode("00000")
                .address("서울시 관리자구")
                .addressDetail("관리자동 1호")
                .role("ROLE_USER")
                .build();

        userRepository.save(admin);
        log.info("[DataInitializer] 테스트 계정 생성 완료 — ID: admin / PW: test1234");
    }

    private void createSampleMembersIfAbsent() {
        if (userRepository.count() >= 5) {
            log.info("[DataInitializer] 샘플 회원 데이터가 이미 존재합니다.");
            return;
        }

        record MemberData(String userId, String userName, String email,
                          String phone, String grade, boolean enabled) {}

        List<MemberData> samples = List.of(
            new MemberData("kim_student",  "김민준", "minjun@example.com",  "01011112222", "초등", true),
            new MemberData("lee_middle",   "이서연", "seoyeon@example.com", "01022223333", "중등", true),
            new MemberData("park_high",    "박도윤", "doyun@example.com",   "01033334444", "고등", true),
            new MemberData("choi_elem",    "최아린", "arin@example.com",    "01044445555", "초등", true),
            new MemberData("jung_mid",     "정하은", "haeun@example.com",   "01055556666", "중등", false),
            new MemberData("han_high",     "한준서", "junseo@example.com",  "01066667777", "고등", true),
            new MemberData("oh_student",   "오수빈", "subin@example.com",   "01077778888", "초등", true),
            new MemberData("yoon_middle",  "윤지호", "jiho@example.com",    "01088889999", "중등", true),
            new MemberData("jang_high",    "장나연", "nayeon@example.com",  "01099990000", "고등", false),
            new MemberData("lim_student",  "임태양", "taeyang@example.com", "01012340001", "중등", true)
        );

        String pw = passwordEncoder.encode("pass1234");
        for (MemberData m : samples) {
            if (!userRepository.existsByUserId(m.userId())) {
                User u = User.builder()
                        .userId(m.userId())
                        .password(pw)
                        .userName(m.userName())
                        .email(m.email())
                        .phoneNumber(m.phone())
                        .zipCode("00000")
                        .address("서울시 강남구")
                        .addressDetail("테스트동 1호")
                        .role("ROLE_USER")
                        .grade(m.grade())
                        .build();
                User saved = userRepository.save(u);
                if (!m.enabled()) {
                    saved.update(m.userName(), m.email(), m.phone(), m.grade(), false);
                    userRepository.save(saved);
                }
            }
        }
        log.info("[DataInitializer] 샘플 회원 {} 명 생성 완료", samples.size());
    }

    private void createProductsIfAbsent() {
        if (productRepository.count() > 0) {
            log.info("[DataInitializer] 상품 데이터가 이미 존재합니다.");
            return;
        }

        List<Product> products = List.of(
            // ── 초등 국어 ──
            Product.builder()
                .title("초등 국어 완전정복 1-2학년")
                .subject("국어").grade("초등1-2학년")
                .price(12000).originalPrice(14000)
                .author("김민지").publisher("GUSA출판")
                .publishedDate("2025-03-01").pages(180).isbn("9791100000001")
                .description("1~2학년 교과 과정에 맞춘 국어 기초 학습서입니다.\n받아쓰기, 독해, 어휘를 체계적으로 학습할 수 있습니다.")
                .tableOfContents("1장. 자음과 모음\n2장. 받아쓰기 기초\n3장. 짧은 글 읽기\n4장. 문장 만들기\n5장. 어휘 늘리기")
                .badge("BEST").isNew(false).build(),

            Product.builder()
                .title("초등 국어 독해력 3-4학년")
                .subject("국어").grade("초등3-4학년")
                .price(13000).originalPrice(15000)
                .author("이서현").publisher("GUSA출판")
                .publishedDate("2025-06-01").pages(200).isbn("9791100000002")
                .description("독해력 향상에 집중한 3~4학년 국어 학습서입니다.\n다양한 지문과 문제로 읽기 능력을 기릅니다.")
                .tableOfContents("1장. 설명문 읽기\n2장. 이야기 읽기\n3장. 시 감상\n4장. 논설문 이해\n5장. 어휘·문법")
                .badge(null).isNew(true).build(),

            Product.builder()
                .title("초등 국어 실력 다지기 5-6학년")
                .subject("국어").grade("초등5-6학년")
                .price(14000).originalPrice(16000)
                .author("박지훈").publisher("GUSA출판")
                .publishedDate("2025-09-01").pages(220).isbn("9791100000003")
                .description("중학교 입학을 앞둔 5~6학년을 위한 국어 심화 학습서입니다.")
                .tableOfContents("1장. 비문학 독해\n2장. 문학 감상\n3장. 글쓰기 전략\n4장. 어법과 맞춤법\n5장. 실전 문제")
                .badge(null).isNew(true).build(),

            // ── 초등 수학 ──
            Product.builder()
                .title("초등 수학 개념잡기 1-2학년")
                .subject("수학").grade("초등1-2학년")
                .price(13000).originalPrice(15000)
                .author("최수아").publisher("GUSA출판")
                .publishedDate("2025-03-01").pages(192).isbn("9791100000004")
                .description("수 개념부터 덧셈·뺄셈까지 쉽고 재미있게 배우는 1~2학년 수학 교재입니다.")
                .tableOfContents("1장. 수와 숫자\n2장. 덧셈\n3장. 뺄셈\n4장. 도형 기초\n5장. 측정 기초")
                .badge("BEST").isNew(false).build(),

            Product.builder()
                .title("초등 수학 완성 3-4학년")
                .subject("수학").grade("초등3-4학년")
                .price(14000).originalPrice(16000)
                .author("정도윤").publisher("GUSA출판")
                .publishedDate("2025-06-01").pages(210).isbn("9791100000005")
                .description("곱셈·나눗셈·분수를 완성하는 3~4학년 수학 학습서입니다.")
                .tableOfContents("1장. 곱셈\n2장. 나눗셈\n3장. 분수 기초\n4장. 소수 기초\n5장. 도형과 측정")
                .badge(null).isNew(false).build(),

            Product.builder()
                .title("초등 수학 심화 5-6학년")
                .subject("수학").grade("초등5-6학년")
                .price(15000).originalPrice(18000)
                .author("강예린").publisher("GUSA출판")
                .publishedDate("2025-09-01").pages(240).isbn("9791100000006")
                .description("중학 수학 대비를 위한 5~6학년 심화 문제집입니다.")
                .tableOfContents("1장. 분수·소수 연산\n2장. 비와 비율\n3장. 통계 기초\n4장. 도형 넓이·부피\n5장. 실전 문제")
                .badge("BEST").isNew(false).build(),

            // ── 중등 수학 ──
            Product.builder()
                .title("중학 수학 개념완성 1학년")
                .subject("수학").grade("중등1학년")
                .price(16000).originalPrice(19000)
                .author("김민준").publisher("GUSA출판")
                .publishedDate("2025-02-01").pages(260).isbn("9791100000007")
                .description("중학교 1학년 수학의 핵심 개념을 완벽하게 정리한 교재입니다.")
                .tableOfContents("1장. 소인수분해\n2장. 정수·유리수\n3장. 문자와 식\n4장. 일차방정식\n5장. 좌표와 그래프")
                .badge("BEST").isNew(false).build(),

            Product.builder()
                .title("중학 수학 유형마스터 2학년")
                .subject("수학").grade("중등2학년")
                .price(17000).originalPrice(20000)
                .author("이준호").publisher("GUSA출판")
                .publishedDate("2025-02-01").pages(280).isbn("9791100000008")
                .description("2학년 수학의 모든 유형을 다루는 종합 문제집입니다.")
                .tableOfContents("1장. 유리수·순환소수\n2장. 식의 계산\n3장. 부등식\n4장. 연립방정식\n5장. 일차함수")
                .badge(null).isNew(false).build(),

            Product.builder()
                .title("중학 수학 실전완성 3학년")
                .subject("수학").grade("중등3학년")
                .price(18000).originalPrice(21000)
                .author("박서연").publisher("GUSA출판")
                .publishedDate("2025-08-01").pages(300).isbn("9791100000009")
                .description("고등 수학 대비를 위한 3학년 수학 실전 교재입니다.")
                .tableOfContents("1장. 제곱근·무리수\n2장. 인수분해\n3장. 이차방정식\n4장. 이차함수\n5장. 삼각비·원의 성질")
                .badge(null).isNew(true).build(),

            // ── 중등 영어 ──
            Product.builder()
                .title("중학 영어 문법 기초 1학년")
                .subject("영어").grade("중등1학년")
                .price(15000).originalPrice(18000)
                .author("윤지아").publisher("GUSA출판")
                .publishedDate("2025-03-01").pages(250).isbn("9791100000010")
                .description("중학교 영어 문법의 기초를 탄탄히 다지는 교재입니다.")
                .tableOfContents("1장. be동사\n2장. 일반동사\n3장. 시제\n4장. 조동사\n5장. 문장의 형식")
                .badge("BEST").isNew(false).build(),

            // ── 고등 수학 ──
            Product.builder()
                .title("고등 수학(상) 개념기본서")
                .subject("수학").grade("고등1학년")
                .price(20000).originalPrice(23000)
                .author("한승우").publisher("GUSA출판")
                .publishedDate("2025-01-15").pages(320).isbn("9791100000011")
                .description("고등학교 수학(상)의 핵심 개념을 체계적으로 정리한 기본서입니다.")
                .tableOfContents("1장. 다항식\n2장. 방정식·부등식\n3장. 도형의 방정식\n4장. 집합과 명제\n5장. 함수")
                .badge("BEST").isNew(false).build(),

            Product.builder()
                .title("고등 수학(하) 실전문제집")
                .subject("수학").grade("고등1학년")
                .price(19000).originalPrice(22000)
                .author("한승우").publisher("GUSA출판")
                .publishedDate("2025-01-15").pages(310).isbn("9791100000012")
                .description("고등학교 수학(하) 실전 대비 문제집입니다.")
                .tableOfContents("1장. 지수·로그\n2장. 삼각함수\n3장. 수열\n4장. 지수·로그 함수\n5장. 수능 실전 문제")
                .badge(null).isNew(false).build(),

            Product.builder()
                .title("수능 수학 1등급 완성")
                .subject("수학").grade("고등3학년")
                .price(25000).originalPrice(28000)
                .author("오태양").publisher("GUSA출판")
                .publishedDate("2026-01-10").pages(380).isbn("9791100000013")
                .description("수능 수학 1등급을 목표로 하는 최종 완성 교재입니다.\n최신 수능 경향을 완벽 반영했습니다.")
                .tableOfContents("1장. 수능 출제 유형 분석\n2장. 취약 유형 집중 훈련\n3장. 고난도 킬러 문항\n4장. 실전 모의고사 5회\n5장. 정답·해설")
                .badge("BEST").isNew(true).build(),

            // ── 고등 영어 ──
            Product.builder()
                .title("수능 영어 독해 완성")
                .subject("영어").grade("고등2학년")
                .price(22000).originalPrice(25000)
                .author("김나래").publisher("GUSA출판")
                .publishedDate("2026-02-01").pages(350).isbn("9791100000014")
                .description("수능 영어 독해의 모든 유형을 완벽히 정리한 교재입니다.")
                .tableOfContents("1장. 주제·제목 찾기\n2장. 빈칸 추론\n3장. 순서·삽입\n4장. 장문 독해\n5장. 실전 모의고사")
                .badge(null).isNew(true).build(),

            // ── 고등 과학 ──
            Product.builder()
                .title("고등 통합과학 핵심정리")
                .subject("과학").grade("고등1학년")
                .price(17000).originalPrice(20000)
                .author("신유진").publisher("GUSA출판")
                .publishedDate("2025-03-01").pages(270).isbn("9791100000015")
                .description("고등학교 통합과학의 핵심을 빠르게 정리하는 교재입니다.")
                .tableOfContents("1장. 물질과 규칙성\n2장. 시스템과 상호작용\n3장. 변화와 다양성\n4장. 환경과 에너지\n5장. 단원별 실전 문제")
                .badge(null).isNew(false).build()
        );

        productRepository.saveAll(products);
        log.info("[DataInitializer] 샘플 상품 {}개 등록 완료", products.size());
    }

    private void createOrdersIfAbsent() {
        if (orderRepository.count() > 0) {
            log.info("[DataInitializer] 주문 데이터가 이미 존재합니다.");
            return;
        }

        List<Product> products = productRepository.findAll();
        if (products.size() < 3) {
            log.warn("[DataInitializer] 상품 데이터 부족으로 샘플 주문을 생성하지 않습니다.");
            return;
        }

        record Sample(String userId, String recipient, String phone, List<long[]> items, String finalStatus) {}

        List<Sample> samples = List.of(
            new Sample("test",  "김민지", "01011112222", List.of(new long[]{products.get(0).getId(), 2}), "DELIVERED"),
            new Sample("test",  "김민지", "01011112222", List.of(new long[]{products.get(1).getId(), 1}, new long[]{products.get(2).getId(), 1}), "SHIPPING"),
            new Sample("test",  "김민지", "01011112222", List.of(new long[]{products.get(3).getId(), 1}), "PAID"),
            new Sample("test",  "김민지", "01011112222", List.of(new long[]{products.get(4).getId(), 3}), "PENDING"),
            new Sample("test",  "김민지", "01011112222", List.of(new long[]{products.get(0).getId(), 1}), "CANCELED"),
            new Sample("GUEST", "이서현", "01033334444", List.of(new long[]{products.get(5).getId(), 1}), "DELIVERED"),
            new Sample("GUEST", "이서현", "01033334444", List.of(new long[]{products.get(6).getId(), 2}), "SHIPPING"),
            new Sample("GUEST", "박지훈", "01055556666", List.of(new long[]{products.get(1).getId(), 1}), "PAID"),
            new Sample("GUEST", "박지훈", "01055556666", List.of(new long[]{products.get(2).getId(), 1}, new long[]{products.get(3).getId(), 1}), "PENDING"),
            new Sample("test",  "김민지", "01011112222", List.of(new long[]{products.get(7 % products.size()).getId(), 1}), "DELIVERED"),
            new Sample("test",  "김민지", "01011112222", List.of(new long[]{products.get(8 % products.size()).getId(), 2}), "PAID"),
            new Sample("GUEST", "최수아", "01077778888", List.of(new long[]{products.get(9 % products.size()).getId(), 1}), "PENDING")
        );

        int created = 0;
        for (Sample s : samples) {
            try {
                OrderCreateRequest req = buildRequest(
                        s.recipient(), s.phone(), "06000", "서울시 강남구 테헤란로", "101호",
                        s.items()
                );
                OrderResponse order = orderService.createOrder(s.userId(), req);
                if (!"PENDING".equals(s.finalStatus())) {
                    applyStatusTransition(order.getOrderId(), s.finalStatus());
                }
                created++;
            } catch (Exception e) {
                log.warn("[DataInitializer] 샘플 주문 생성 실패: {}", e.getMessage());
            }
        }
        log.info("[DataInitializer] 샘플 주문 {}건 생성 완료", created);
    }

    private OrderCreateRequest buildRequest(String recipient, String phone,
                                            String zip, String address, String addressDetail,
                                            List<long[]> itemSpecs) {
        OrderCreateRequest req = new OrderCreateRequest();
        req.setRecipientName(recipient);
        req.setPhoneNumber(phone);
        req.setZipCode(zip);
        req.setAddress(address);
        req.setAddressDetail(addressDetail);

        List<OrderItemRequest> items = new ArrayList<>();
        for (long[] spec : itemSpecs) {
            OrderItemRequest item = new OrderItemRequest();
            item.setProductId(spec[0]);
            item.setQuantity((int) spec[1]);
            items.add(item);
        }
        req.setItems(items);
        return req;
    }

    private void applyStatusTransition(String orderId, String targetStatus) {
        // PENDING → PAID → SHIPPING → DELIVERED / CANCELED
        List<String> path = switch (targetStatus) {
            case "PAID"      -> List.of("PAID");
            case "SHIPPING"  -> List.of("PAID", "SHIPPING");
            case "DELIVERED" -> List.of("PAID", "SHIPPING", "DELIVERED");
            case "CANCELED"  -> List.of("CANCELED");
            default          -> List.of();
        };
        for (String status : path) {
            orderService.updateOrderStatus(orderId, status);
        }
    }
}
