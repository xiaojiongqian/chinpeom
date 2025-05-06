import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userApi, isAuthenticated, isOffline } from '../../src/services/api';

// 这个测试文件专门用于确保用户API在测试环境中正确mock

describe('用户API模拟', () => {
  // 确保在每个测试前重置所有模拟函数
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('注册与登录功能', () => {
    it('应该能模拟用户注册过程', async () => {
      const result = await userApi.register('testuser', 'test@example.com', 'password123');
      
      expect(userApi.register).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('username', 'testuser');
      expect(result.user).toHaveProperty('email', 'test@example.com');
    });

    it('应该能模拟用户登录过程', async () => {
      const result = await userApi.login('test@example.com', 'password123');
      
      expect(userApi.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('email', 'test@example.com');
    });

    it('应该能模拟用户登出过程', () => {
      userApi.logout();
      
      expect(userApi.logout).toHaveBeenCalled();
    });
  });

  describe('用户信息功能', () => {
    it('应该能模拟获取当前用户信息', async () => {
      const user = await userApi.getCurrentUser();
      
      expect(userApi.getCurrentUser).toHaveBeenCalled();
      expect(user).toHaveProperty('id', 'test-user-id');
      expect(user).toHaveProperty('username', 'testuser');
      expect(user).toHaveProperty('score', 15);
    });

    it('应该能模拟更新用户分数', async () => {
      const scoreDelta = 5;
      const user = await userApi.updateScore(scoreDelta);
      
      expect(userApi.updateScore).toHaveBeenCalledWith(scoreDelta);
      expect(user).toHaveProperty('score', 20); // 15 + 5
    });

    it('应该能模拟更新用户语言设置', async () => {
      const language = 'english';
      const user = await userApi.updateLanguage(language);
      
      expect(userApi.updateLanguage).toHaveBeenCalledWith(language);
      expect(user).toHaveProperty('preferredLanguage', language);
    });
  });

  describe('排行榜功能', () => {
    it('应该能模拟获取排行榜数据', async () => {
      const leaderboard = await userApi.getLeaderboard();
      
      expect(userApi.getLeaderboard).toHaveBeenCalled();
      expect(Array.isArray(leaderboard)).toBe(true);
      expect(leaderboard.length).toBeGreaterThan(0);
      expect(leaderboard[0]).toHaveProperty('username');
      expect(leaderboard[0]).toHaveProperty('score');
    });
  });

  describe('辅助功能', () => {
    it('应该能模拟认证状态检查', () => {
      const authenticated = isAuthenticated();
      
      expect(isAuthenticated).toHaveBeenCalled();
      expect(typeof authenticated).toBe('boolean');
    });

    it('应该能模拟离线状态检查', () => {
      const offline = isOffline();
      
      expect(isOffline).toHaveBeenCalled();
      expect(typeof offline).toBe('boolean');
    });
  });
}); 