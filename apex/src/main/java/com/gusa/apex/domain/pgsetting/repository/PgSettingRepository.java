package com.gusa.apex.domain.pgsetting.repository;

import com.gusa.apex.domain.pgsetting.entity.PgSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PgSettingRepository extends JpaRepository<PgSetting, Long> {
    Optional<PgSetting> findByPgProvider(String pgProvider);
}
