package com.gusa.apex;

import com.gusa.apex.domain.banksetting.dto.BankSettingResponse;
import com.gusa.apex.domain.banksetting.entity.BankSetting;
import com.gusa.apex.domain.banksetting.repository.BankSettingRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ApexApplicationTests {

	@Autowired
	private BankSettingRepository bankSettingRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void saveSettingTest() {
		List<BankSetting> all = bankSettingRepository.findAll();
		BankSetting setting;

		setting = all.get(0);
		setting.update("농협은행", "123-456-789011",
				"구사", "주문번호를 입금자명에 기재해주세요.",
				true, true);

		BankSetting updated = bankSettingRepository.save(setting);

		BankSettingResponse response = BankSettingResponse.from(updated);
	}

}
