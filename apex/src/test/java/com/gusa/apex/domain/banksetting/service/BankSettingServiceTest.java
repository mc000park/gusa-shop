package com.gusa.apex.domain.banksetting.service;

import com.gusa.apex.domain.banksetting.dto.BankSettingRequest;
import com.gusa.apex.domain.banksetting.dto.BankSettingResponse;
import com.gusa.apex.domain.banksetting.entity.BankSetting;
import com.gusa.apex.domain.banksetting.repository.BankSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BankSettingServiceTest {

    @Mock
    private BankSettingRepository bankSettingRepository;

    @InjectMocks
    private BankSettingService bankSettingService;

    private BankSetting existingSetting;

    @BeforeEach
    void setUp() {
        existingSetting = BankSetting.builder()
                .bankName("국민은행")
                .accountNumber("123-456-789012")
                .accountHolder("(주)구사")
                .depositNote("주문번호를 입금자명에 기재해주세요")
                .enabled(true)
                .cardEnabled(true)
                .build();
    }

    @Nested
    @DisplayName("getSetting()")
    class GetSetting {

        @Test
        @DisplayName("저장된 설정이 없으면 기본 empty 응답을 반환한다")
        void returnsEmptyWhenNoneExists() {
            given(bankSettingRepository.findAll()).willReturn(List.of());

            BankSettingResponse result = bankSettingService.getSetting();

            assertThat(result.getBankName()).isEmpty();
            assertThat(result.isEnabled()).isFalse();
            assertThat(result.isCardEnabled()).isTrue();
        }

        @Test
        @DisplayName("저장된 설정이 있으면 첫 번째 레코드를 반환한다")
        void returnsFirstRecordWhenExists() {
            given(bankSettingRepository.findAll()).willReturn(List.of(existingSetting));

            BankSettingResponse result = bankSettingService.getSetting();

            assertThat(result.getBankName()).isEqualTo("국민은행");
            assertThat(result.getAccountNumber()).isEqualTo("123-456-789012");
            assertThat(result.getAccountHolder()).isEqualTo("(주)구사");
            assertThat(result.isEnabled()).isTrue();
            assertThat(result.isCardEnabled()).isTrue();
        }

        @Test
        @DisplayName("cardEnabled=false 설정을 올바르게 반환한다")
        void returnsCardEnabledFalse() {
            BankSetting cardDisabled = BankSetting.builder()
                    .bankName("국민은행")
                    .accountNumber("123-456-789012")
                    .accountHolder("(주)구사")
                    .depositNote("")
                    .enabled(true)
                    .cardEnabled(false)
                    .build();
            given(bankSettingRepository.findAll()).willReturn(List.of(cardDisabled));

            BankSettingResponse result = bankSettingService.getSetting();

            assertThat(result.isCardEnabled()).isFalse();
        }
    }

    @Nested
    @DisplayName("saveSetting()")
    class SaveSetting {

        private BankSettingRequest buildRequest(String bank, String account,
                                                String holder, boolean enabled,
                                                boolean cardEnabled) {
            BankSettingRequest req = new BankSettingRequest();
            req.setBankName(bank);
            req.setAccountNumber(account);
            req.setAccountHolder(holder);
            req.setDepositNote("");
            req.setEnabled(enabled);
            req.setCardEnabled(cardEnabled);
            return req;
        }

        @Test
        @DisplayName("기존 설정이 없으면 새 엔티티를 생성하여 저장한다")
        void createsNewSettingWhenNoneExists() {
            given(bankSettingRepository.findAll()).willReturn(List.of());
            given(bankSettingRepository.save(any(BankSetting.class)))
                    .willAnswer(inv -> inv.getArgument(0));

            BankSettingRequest req = buildRequest("신한은행", "999-888-777", "홍길동", true, true);

            BankSettingResponse result = bankSettingService.saveSetting(req);

            assertThat(result.getBankName()).isEqualTo("신한은행");
            assertThat(result.getAccountNumber()).isEqualTo("999-888-777");
            assertThat(result.getAccountHolder()).isEqualTo("홍길동");
            assertThat(result.isEnabled()).isTrue();
            assertThat(result.isCardEnabled()).isTrue();
            verify(bankSettingRepository).save(any(BankSetting.class));
        }

        @Test
        @DisplayName("기존 설정이 있으면 update()를 호출하고 저장한다")
        void updatesExistingSettingWhenOneExists() {
            given(bankSettingRepository.findAll()).willReturn(List.of(existingSetting));
            given(bankSettingRepository.save(existingSetting)).willReturn(existingSetting);

            BankSettingRequest req = buildRequest("우리은행", "111-222-333", "김철수", false, false);

            BankSettingResponse result = bankSettingService.saveSetting(req);

            assertThat(result.getBankName()).isEqualTo("우리은행");
            assertThat(result.isEnabled()).isFalse();
            assertThat(result.isCardEnabled()).isFalse();
            verify(bankSettingRepository).save(existingSetting);
        }

        @Test
        @DisplayName("cardEnabled=false 로 저장하면 응답에 false가 반환된다")
        void savesCardEnabledFalse() {
            given(bankSettingRepository.findAll()).willReturn(List.of());
            given(bankSettingRepository.save(any(BankSetting.class)))
                    .willAnswer(inv -> inv.getArgument(0));

            BankSettingRequest req = buildRequest("국민은행", "123", "구사", true, false);

            BankSettingResponse result = bankSettingService.saveSetting(req);

            assertThat(result.isCardEnabled()).isFalse();
        }

        @Test
        @DisplayName("cardEnabled=true 로 저장하면 응답에 true가 반환된다")
        void savesCardEnabledTrue() {
            given(bankSettingRepository.findAll()).willReturn(List.of(existingSetting));
            given(bankSettingRepository.save(existingSetting)).willReturn(existingSetting);

            BankSettingRequest req = buildRequest("국민은행", "123", "구사", true, true);

            BankSettingResponse result = bankSettingService.saveSetting(req);

            assertThat(result.isCardEnabled()).isTrue();
        }

        @Test
        @DisplayName("save()는 항상 정확히 한 번 호출된다")
        void repositorySaveCalledExactlyOnce() {
            given(bankSettingRepository.findAll()).willReturn(List.of());
            given(bankSettingRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

            bankSettingService.saveSetting(buildRequest("은행", "계좌", "예금주", false, true));

            verify(bankSettingRepository, times(1)).save(any());
        }
    }
}
