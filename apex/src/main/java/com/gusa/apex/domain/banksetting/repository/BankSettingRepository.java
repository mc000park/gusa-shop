package com.gusa.apex.domain.banksetting.repository;

import com.gusa.apex.domain.banksetting.entity.BankSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankSettingRepository extends JpaRepository<BankSetting, Long> {
}
