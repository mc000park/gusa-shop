package com.gusa.apex.domain.user.repository;

import com.gusa.apex.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByUserId(String userId);

    boolean existsByPhoneNumber(String phoneNumber);

    Optional<User> findByUserId(String userId);

    @Query(
        value = """
            SELECT u FROM User u
            WHERE (:keyword IS NULL OR
                   u.userId   LIKE CONCAT('%', :keyword, '%') OR
                   u.userName LIKE CONCAT('%', :keyword, '%') OR
                   u.email    LIKE CONCAT('%', :keyword, '%'))
              AND (:grade IS NULL OR u.grade = :grade)
              AND (:enabled IS NULL OR u.enabled = :enabled)
            ORDER BY u.createdAt DESC
        """,
        countQuery = """
            SELECT COUNT(u) FROM User u
            WHERE (:keyword IS NULL OR
                   u.userId   LIKE CONCAT('%', :keyword, '%') OR
                   u.userName LIKE CONCAT('%', :keyword, '%') OR
                   u.email    LIKE CONCAT('%', :keyword, '%'))
              AND (:grade IS NULL OR u.grade = :grade)
              AND (:enabled IS NULL OR u.enabled = :enabled)
        """
    )
    Page<User> searchUsers(
            @Param("keyword") String keyword,
            @Param("grade") String grade,
            @Param("enabled") Boolean enabled,
            Pageable pageable
    );
}
