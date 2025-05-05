<template>
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-4">唐诗译境 - 答题挑战</h1>
    
    <!-- 难度模式切换 -->
    <div class="flex justify-center space-x-4 mb-6">
      <button 
        @click="setDifficulty('easy')" 
        class="py-2 px-4 rounded-full transition-colors"
        :class="[
          currentDifficulty === 'easy' 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        ]"
      >
        简单模式
      </button>
      <button 
        @click="setDifficulty('normal')" 
        class="py-2 px-4 rounded-full transition-colors"
        :class="[
          currentDifficulty === 'normal' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        ]"
      >
        普通模式
      </button>
      <button 
        @click="setDifficulty('hard')" 
        class="py-2 px-4 rounded-full transition-colors"
        :class="[
          currentDifficulty === 'hard' 
            ? 'bg-red-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        ]"
      >
        困难模式
      </button>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="loadError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-xl mx-auto">
      <p>{{ loadError }}</p>
      <button 
        @click="initialize" 
        class="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        重试
      </button>
    </div>
    
    <div v-else class="max-w-3xl mx-auto">
      <!-- 诗歌内容区 -->
      <div class="poem-content bg-amber-50 rounded-lg shadow-md p-6 mb-8">
        <!-- 诗歌标题和作者 -->
        <div class="text-center mb-6">
          <h2 v-if="currentPoem" class="text-2xl font-bold text-gray-800">{{ currentPoem.title }}</h2>
          <p v-if="currentPoem" class="text-gray-600 mt-1">{{ currentPoem.author }}</p>
        </div>
        
        <!-- 诗歌图片 -->
        <div v-if="hasImage" class="mb-6">
          <img :src="imagePath" :alt="currentPoem?.title" class="w-full h-48 object-cover rounded-md shadow" />
        </div>
        
        <!-- 诗歌内容 -->
        <div v-if="displayContent" class="space-y-2 text-lg">
          <p 
            v-for="(line, index) in displayContent" 
            :key="index"
            class="poem-line"
            :class="{
              'text-gray-800': index !== currentSentenceIndex,
              'text-blue-600 font-medium': index === currentSentenceIndex && currentDifficulty !== 'hard',
              'text-red-600 font-medium': index === currentSentenceIndex && currentDifficulty === 'hard'
            }"
          >
            {{ line }}
          </p>
        </div>
        
        <!-- 困难模式提示 -->
        <div v-if="currentDifficulty === 'hard'" class="mt-4 text-center text-sm text-red-500">
          困难模式：根据上下文猜测缺失的诗句
        </div>
      </div>
      
      <!-- 答题区域 -->
      <div class="mb-6">
        <h3 class="text-lg font-bold mb-3 text-gray-700">请选择正确的中文诗句:</h3>
        <AnswerOptions 
          v-if="options.length > 0"
          :options="options" 
          :answered="answered" 
          :selectedIndex="selectedOptionIndex" 
          :isCorrect="isCorrect" 
          @select="handleSelect"
        />
      </div>
      
      <!-- 分数显示（仅登录用户可见） -->
      <div v-if="userStore.isLoggedIn" class="text-center mb-6">
        <div class="inline-block bg-blue-50 rounded-lg py-2 px-4 border border-blue-100">
          <span class="font-medium">当前得分: </span>
          <span class="text-blue-600 font-bold">{{ userStore.score }}</span>
          <span class="ml-3 font-medium">学级称号: </span>
          <span class="text-indigo-600 font-bold">{{ userStore.rank }}</span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex justify-center mt-8">
        <button 
          @click="getNextPoem" 
          class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full transition-colors mr-4"
        >
          下一首
        </button>
        <router-link to="/" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-full transition-colors">
          返回首页
        </router-link>
      </div>
      
      <!-- 反馈对话框 -->
      <FeedbackDialog
        v-if="showFeedback"
        :show="showFeedback"
        :isCorrect="isCorrect === true"
        :correctAnswer="correctAnswer"
        :selectedAnswer="selectedAnswer"
        :poemTitle="currentPoem?.title || ''"
        :poemAuthor="currentPoem?.author || ''"
        :scoreChange="scoreChange"
        @close="closeFeedback"
        @next="getNextPoem"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { usePoemStore } from '../stores/poem';
import { useUserStore } from '../stores/user';
import AnswerOptions from '../components/AnswerOptions.vue';
import FeedbackDialog from '../components/FeedbackDialog.vue';
import type { PoemOption } from '../types';
import type { DifficultyLevel } from '../utils/optionsGenerator';

// 获取store
const poemStore = usePoemStore();
const userStore = useUserStore();

// 本地状态
const answered = ref(false);
const selectedOptionIndex = ref<number | null>(null);
const isCorrect = ref<boolean | null>(null);
const showFeedback = ref(false);
const selectedAnswer = ref('');
const scoreChange = ref(0);

// 从store获取状态
const currentPoem = computed(() => poemStore.currentPoem);
const options = computed(() => poemStore.options);
const currentSentenceIndex = computed(() => poemStore.currentSentenceIndex);
const displayContent = computed(() => poemStore.displayContent);
const hasImage = computed(() => poemStore.hasImage);
const imagePath = computed(() => poemStore.imagePath);
const isLoading = computed(() => poemStore.isLoading);
const loadError = computed(() => poemStore.loadError);
const currentDifficulty = computed(() => poemStore.currentDifficulty);

// 获取正确答案
const correctAnswer = computed(() => {
  const correctOption = options.value.find(opt => opt.isCorrect);
  return correctOption ? correctOption.value : '';
});

// 初始化
async function initialize() {
  // 重置本地状态
  answered.value = false;
  selectedOptionIndex.value = null;
  isCorrect.value = null;
  showFeedback.value = false;
  
  // 初始化诗歌数据
  await poemStore.initialize();
}

// 设置难度
function setDifficulty(difficulty: DifficultyLevel) {
  if (poemStore.currentDifficulty !== difficulty) {
    // 重置本地状态
    answered.value = false;
    selectedOptionIndex.value = null;
    isCorrect.value = null;
    showFeedback.value = false;
    
    // 设置难度并重新选择诗歌
    poemStore.setDifficulty(difficulty);
  }
}

// 根据难度计算得分
function calculateScoreChange(isCorrect: boolean): number {
  // 基于难度的得分计算
  switch (currentDifficulty.value) {
    case 'easy':
      return isCorrect ? 1 : -1;
    case 'normal':
      return isCorrect ? 2 : -1;
    case 'hard':
      return isCorrect ? 3 : -2;
    default:
      return isCorrect ? 1 : -1;
  }
}

// 处理选项选择
function handleSelect(index: number) {
  selectedOptionIndex.value = index;
  const selectedOption = options.value[index];
  selectedAnswer.value = selectedOption.value;
  
  // 检查答案是否正确
  isCorrect.value = poemStore.checkAnswer(selectedOption.value);
  answered.value = true;
  
  // 更新得分
  if (userStore.isLoggedIn) {
    // 根据难度计算得分变化
    scoreChange.value = calculateScoreChange(isCorrect.value);
    userStore.updateScore(scoreChange.value);
  }
  
  // 显示反馈对话框
  setTimeout(() => {
    showFeedback.value = true;
  }, 1000);
}

// 关闭反馈对话框
function closeFeedback() {
  showFeedback.value = false;
}

// 获取下一首诗
function getNextPoem() {
  // 重置状态
  answered.value = false;
  selectedOptionIndex.value = null;
  isCorrect.value = null;
  showFeedback.value = false;
  
  // 选择下一首诗，保持当前难度
  poemStore.selectRandomPoem(currentDifficulty.value);
}

// 监听难度变化，更新界面提示
watch(currentDifficulty, (newDifficulty) => {
  console.log(`难度模式已更改为: ${newDifficulty}`);
});

// 组件挂载时初始化
onMounted(() => {
  initialize();
});
</script>

<style scoped>
.poem-line {
  text-align: center;
  line-height: 1.8;
}

/* 难度模式按钮动画 */
button {
  transition: all 0.3s ease;
}

/* 诗歌内容卡片阴影增强 */
.poem-content {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.poem-content:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style> 