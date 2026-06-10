package com.example.usedcars.repository;

import com.example.usedcars.model.RecentView;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecentViewRepository extends JpaRepository<RecentView, Long> {
    List<RecentView> findTop10BySessionTokenOrderByViewedAtDesc(String sessionToken);
}
