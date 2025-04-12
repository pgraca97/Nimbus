<template>
  <main class="help-support">
    <div class="header-container">
      <HeaderDashboard />
    </div>
    <div class="content-container">
      <h1>How can we help you?</h1>
      
      <!-- Search Bar -->
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Start typing your question"
          v-model="searchQuery"
          @input="handleSearch"
        >
        <button class="search-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.5 16.5M16.5 16.5C18.1569 14.8431 19 12.5858 19 10C19 7.41421 18.1569 5.15685 16.5 3.5C14.8431 1.84315 12.5858 1 10 1C7.41421 1 5.15685 1.84315 3.5 3.5C1.84315 5.15685 1 7.41421 1 10C1 12.5858 1.84315 14.8431 3.5 16.5C5.15685 18.1569 7.41421 19 10 19C12.5858 19 14.8431 18.1569 16.5 16.5Z" stroke="#303030" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- FAQ Section -->
      <section class="faq-section">
        <h2>Frequently asked questions</h2>
        
        <!-- No Results State -->
        <div v-if="filteredFaqs.length === 0" class="no-results">
          <div class="no-results-content">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" stroke="#9E9E9E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M44 44L34 34" stroke="#9E9E9E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>No matches found</h3>
            <p>We couldn't find any FAQs matching your search. Try different keywords or check out our support section for more help.</p>
          </div>
        </div>

        <!-- FAQ List -->
        <div v-else class="faq-list">
          <div 
            v-for="(faq, index) in filteredFaqs" 
            :key="index"
            class="faq-item"
            :class="{ 'expanded': expandedFaq === index }"
          >
            <div class="faq-header" @click="toggleFaq(index)">
              <h3>{{ faq.question }}</h3>
              <svg class="chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="#303030" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <transition name="fade">
              <div class="faq-content" v-if="expandedFaq === index">
                <p>{{ faq.answer }}</p>
              </div>
            </transition>
          </div>
        </div>
      </section>

      <!-- Feedback Section -->
      <section class="feedback-section">
        <h2>Give us your feedback!</h2>
        <div class="feedback-grid">
          <!-- What Worked -->
          <div class="feedback-card" :class="{ 'has-content': feedbackWorked.length > 0 }">
            <h3>What worked</h3>
            <div class="textarea-container">
              <textarea 
                v-model="feedbackWorked"
                placeholder="Share with us what you loved about Nimbus today. Did the weather alerts come in handy? Was the dashboard intuitively helpful? Let us know!"
                maxlength="300"
                :disabled="isSubmitting"
              ></textarea>
              <div class="char-counter" :class="{ 'limit-reached': feedbackWorked.length === 300 }">
                {{ feedbackWorked.length }}/300
              </div>
            </div>
          </div>

          <!-- What Should Be Improved -->
          <div class="feedback-card" :class="{ 'has-content': feedbackImprove.length > 0 }">
            <h3>What should be improved</h3>
            <div class="textarea-container">
              <textarea 
                v-model="feedbackImprove"
                placeholder="Got a suggestion for enhancement? Something that didn't quite hit the mark? We're all ears and eager to make your experience even better."
                maxlength="300"
                :disabled="isSubmitting"
              ></textarea>
              <div class="char-counter" :class="{ 'limit-reached': feedbackImprove.length === 300 }">
                {{ feedbackImprove.length }}/300
              </div>
            </div>
          </div>

          <!-- Questions -->
          <div class="feedback-card" :class="{ 'has-content': feedbackQuestions.length > 0 }">
            <h3>Questions</h3>
            <div class="textarea-container">
              <textarea 
                v-model="feedbackQuestions"
                placeholder="Is there something about Nimbus that puzzles you? Drop your questions here and we'll clear up the cloudy bits for you."
                maxlength="300"
                :disabled="isSubmitting"
              ></textarea>
              <div class="char-counter" :class="{ 'limit-reached': feedbackQuestions.length === 300 }">
                {{ feedbackQuestions.length }}/300
              </div>
            </div>
          </div>

          <!-- Ideas -->
          <div class="feedback-card" :class="{ 'has-content': feedbackIdeas.length > 0 }">
            <h3>Ideas</h3>
            <div class="textarea-container">
              <textarea 
                v-model="feedbackIdeas"
                placeholder="Got a bright idea that could spark a new feature or an improvement? Enlighten us; your innovative thoughts are always welcome!"
                maxlength="300"
                :disabled="isSubmitting"
              ></textarea>
              <div class="char-counter" :class="{ 'limit-reached': feedbackIdeas.length === 300 }">
                {{ feedbackIdeas.length }}/300
              </div>
            </div>
          </div>
        </div>

        <!-- Submission Status -->
        <div class="submission-status">
          <div v-show="submissionStatus" class="status-message" :class="submissionStatus?.type">
            <svg v-if="submissionStatus?.type === 'success'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="submissionStatus?.type === 'error'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ submissionStatus?.message }}
          </div>
        </div>

        <button 
          class="submit-button" 
          @click="submitFeedback"
          :disabled="isSubmitting || !hasAnyFeedback"
        >
          <span v-if="isSubmitting">
            <svg class="spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <circle class="spinner-head" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="2 58" />
            </svg>
          </span>
          <span v-else>Submit</span>
        </button>
      </section>
    </div>
    
    <!-- Wave Background -->
    <div class="wave-background">
      <svg width="100%" height="321" viewBox="0 0 1280 321" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M1279.82 321H0.180296L0 22.9703C0 21.3861 1.32054 20.066 2.90519 20.066C3.56546 20.066 4.22573 20.33 4.75395 20.726C90.8532 87.5252 169.689 82.2446 241.131 4.88434C244.168 1.58399 247.205 1.58399 250.374 4.88434C334.757 88.7133 418.083 88.7133 500.485 4.88434C505.635 -0.264206 510.125 0.131838 514.219 6.07247L524.255 20.9901C525.575 22.9703 527.16 24.5545 529.141 26.0066C611.939 87.9212 688.662 80.3964 759.311 3.43223C763.14 -0.660206 766.838 -0.52823 770.139 3.96025C834.846 89.2413 947.62 85.941 1015.63 3.96025C1017.8 1.3881 1019.98 0.0680165 1022.18 0L1022.53 5.33328e-08C1024.61 0.0644346 1026.71 1.25251 1028.83 3.56422C1031.47 6.43188 1034.09 9.65605 1036.75 12.9301C1041.69 19.001 1046.76 25.2434 1052.34 29.703C1104.37 71.0234 1159.83 78.0202 1218.86 50.6932C1239.66 41.0962 1253.69 26.4535 1268.97 10.5058C1270.09 9.34252 1271.21 8.17229 1272.34 6.99657C1277.49 1.84802 1280 2.90415 1280 10.1649L1279.82 321Z" fill="#519181"/>
      </svg>
    </div>
  </main>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import HeaderDashboard from '@/components/HeaderDashboard.vue';

export default defineComponent({
  name: 'HelpAndSupportView',
  components: {
    HeaderDashboard
  },
  setup() {
    const searchQuery = ref('');
    const expandedFaq = ref(null);
    const feedbackWorked = ref('');
    const feedbackImprove = ref('');
    const feedbackQuestions = ref('');
    const feedbackIdeas = ref('');
    const isSubmitting = ref(false);
    const submissionStatus = ref(null);

    const faqs = ref([
      {
        question: "How can I customize weather alerts on Nimbus?",
        answer: "To personalize your weather alerts, simply head over to 'My Account'. On the top right, beyond the three dots, you'll find a container where you can tweak alert settings to your preference. This is also the place to add Additional Cities for tracking if you're using the Advanced Dashboard mode. Plus, you can easily adjust your Language and Region settings here to make Nimbus feel just right for you!"
      },
      {
        question: "Is there any cost associated with using Nimbus?",
        answer: "Nimbus offers a comprehensive weather experience at no upfront cost. Enjoy real-time updates and customization for free. For advanced features, explore our premium plans that offer even more detailed insights."
      },
      {
        question: "How does Nimbus ensure the accuracy of its weather forecasts?",
        answer: "Our advanced algorithms pull from multiple trusted sources to ensure accurate forecasts. The Nimbus team tirelessly updates and refines our models, providing you with the confidence to plan your day with precision."
      }
    ]);

    // Computed property for filtered FAQs
    const filteredFaqs = computed(() => {
      const query = searchQuery.value.toLowerCase().trim();
      if (!query) return faqs.value;

      return faqs.value.filter(faq => {
        const questionMatch = faq.question.toLowerCase().includes(query);
        const answerMatch = faq.answer.toLowerCase().includes(query);
        return questionMatch || answerMatch;
      });
    });

    // Computed property to check if any feedback is provided
    const hasAnyFeedback = computed(() => {
      return feedbackWorked.value.trim() ||
             feedbackImprove.value.trim() ||
             feedbackQuestions.value.trim() ||
             feedbackIdeas.value.trim();
    });

    // Method to handle search input
    const handleSearch = () => {
      // Reset expanded FAQ when searching
      expandedFaq.value = null;
    };

    // Method to toggle FAQ expansion
    const toggleFaq = (index) => {
      expandedFaq.value = expandedFaq.value === index ? null : index;
    };

    // Method to submit feedback
    const submitFeedback = async () => {
      if (!hasAnyFeedback.value || isSubmitting.value) return;

      isSubmitting.value = true;
      submissionStatus.value = null;

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Success state
        submissionStatus.value = {
          type: 'success',
          message: 'Thank you for your feedback! We really appreciate your input.'
        };

        // Clear form
        feedbackWorked.value = '';
        feedbackImprove.value = '';
        feedbackQuestions.value = '';
        feedbackIdeas.value = '';

      } catch (error) {
        // Error state
        submissionStatus.value = {
          type: 'error',
          message: 'Oops! Something went wrong. Please try again.'
        };
      } finally {
        isSubmitting.value = false;

        // Clear status message after 5 seconds
        setTimeout(() => {
          submissionStatus.value = null;
        }, 5000);
      }
    };

    return {
      searchQuery,
      expandedFaq,
      filteredFaqs,
      feedbackWorked,
      feedbackImprove,
      feedbackQuestions,
      feedbackIdeas,
      isSubmitting,
      submissionStatus,
      hasAnyFeedback,
      handleSearch,
      toggleFaq,
      submitFeedback
    };
  }
});
</script>

<style scoped>
.help-support {
  min-height: 100vh;
  background-color: #FAF8ED;
  padding: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-container {
  width: 1260px;
  margin: 1rem auto 0;
  padding: 0 32px;
}

.header-container :deep(#logged2) {
  border: 1px solid #303030;
  border-radius: 50px 50px 10px 10px;
  margin-top: 1rem;
}

.content-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
  margin-top: 2rem;
}

h1 {
  font-family: 'Recoleta', serif;
  font-size: 2.5rem;
  color: #303030;
  text-align: center;
  margin-bottom: 2rem;
}

/* Search Bar Styles */
.search-container {
  position: relative;
  max-width: 400px;
  margin: 0 auto 4rem;
  display: flex;
  align-items: center;
  border: 1px solid #E0E0E0;
  border-radius: 30px;
  background: white;
  padding-right: 0.5rem;
}

.search-container input {
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 30px;
  background: transparent;
  font-size: 1rem;
  color: #303030;
  font-family: 'Asap', sans-serif;
}

.search-container input::placeholder {
  color: #9E9E9E;
  font-family: 'Asap', sans-serif;
}

.search-button {
  position: static;
  transform: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button svg {
  width: 20px;
  height: 20px;
}

.search-button svg path {
  stroke: #9E9E9E;
}

/* FAQ Section Styles */
.faq-section {
  margin-bottom: 4rem;
}

.faq-section h2 {
  font-family: 'Recoleta', serif;
  font-size: 2rem;
  color: #303030;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.faq-item {
  background: #FAF8ED;
  border-bottom: 1px solid #E0E0E0;
  margin-bottom: 0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-header {
  padding: 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.faq-header h3 {
  font-family: 'Asap', sans-serif;
  font-size: 1.1rem;
  color: #303030;
  margin: 0;
  font-weight: 500;
}

.chevron {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expanded .chevron {
  transform: rotate(180deg);
}

.faq-content {
  padding: 0 0 1.5rem 0;
  color: #666666;
  line-height: 1.6;
  font-family: 'Asap', sans-serif;
}

.faq-content p {
  margin: 0;
  font-size: 1rem;
}

/* Add Vue transition classes */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 200px;
  opacity: 1;
}

.fade-enter-from,
.fade-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Feedback Section Styles */
.feedback-section {
  position: relative;
  margin-bottom: 0;
  padding-bottom: 12rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feedback-section h2 {
  font-family: 'Recoleta', serif;
  font-size: 2.5rem;
  color: #303030;
  text-align: center;
  margin-bottom: 3rem;
}

.feedback-grid {
  position: relative;
  z-index: 2;
  margin-bottom: 4rem;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.feedback-card:nth-last-child(-n+2) {
  position: relative;
  z-index: 1;
  margin-bottom: -2rem;
}

.feedback-card {
  background: white;
  border: 1px solid #E0E0E0;
  border-radius: 20px;
  padding: 1.5rem;
  position: relative;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.3s ease;
}

.feedback-card h3 {
  font-family: 'Recoleta', serif;
  font-size: 1.5rem;
  color: #303030;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.textarea-container {
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.feedback-card textarea {
  width: 100%;
  flex-grow: 1;
  padding: 0.5rem 0;
  padding-bottom: 2rem;
  border: none;
  border-radius: 0;
  resize: none;
  font-family: 'Asap', sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: #666666;
  background: transparent;
  overflow-y: auto;
}

/* Webkit scrollbar styles */
.feedback-card textarea::-webkit-scrollbar {
  width: 4px;
}

.feedback-card textarea::-webkit-scrollbar-track {
  background: transparent;
}

.feedback-card textarea::-webkit-scrollbar-thumb {
  background-color: #E0E0E0;
  border-radius: 4px;
}

/* Firefox scrollbar styles */
.feedback-card textarea {
  scrollbar-width: thin;
  scrollbar-color: #E0E0E0 transparent;
}

.feedback-card textarea::placeholder {
  color: #9E9E9E;
  font-family: 'Asap', sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  opacity: 1;
}

.feedback-card textarea:focus {
  outline: none;
  border-bottom: 1px solid #E0E0E0;
}

.char-counter {
  position: absolute;
  bottom: 0;
  right: 0;
  font-family: 'Asap', sans-serif;
  font-size: 0.875rem;
  color: #9E9E9E;
  transition: color 0.2s ease;
  padding: 0.5rem 0;
  background: white;
  z-index: 1;
}

.char-counter.limit-reached {
  color: #FF4D4D;
}

.submit-button {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 1.25rem 0;
  width: 180px; /* Fixed width */
  height: 60px; /* Fixed height */
  background: white;
  color: #303030;
  border: 1px solid #E0E0E0;
  border-radius: 40px;
  font-family: 'Recoleta', serif;
  font-weight: 600;
  font-size: 1.125rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: color 0.4s ease;
}

.submit-button span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.spinner {
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

/* Status Message Container */
.submission-status {
  position: relative;
  z-index: 2;
  height: 80px;
  margin: 2rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-message {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 30px;
  font-family: 'Asap', sans-serif;
  animation: slideIn 0.3s ease;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.status-message[style*="display: none"] {
  opacity: 0;
  transform: translateY(-10px);
}

.status-message.success {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.status-message.error {
  background-color: #FFEBEE;
  color: #C62828;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Button States */
.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Wave Background */
.wave-background {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  pointer-events: none;
  min-width: 100%;
}

.wave-background svg {
  display: block;
  width: 100%;
  height: auto;
  vertical-align: bottom;
}

/* No Results Styles */
.no-results {
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border: 1px solid #E0E0E0;
  border-radius: 20px;
}

.no-results-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-results svg {
  margin-bottom: 1rem;
}

.no-results h3 {
  font-family: 'Recoleta', serif;
  font-size: 1.5rem;
  color: #303030;
  margin-bottom: 0.5rem;
}

.no-results p {
  font-family: 'Asap', sans-serif;
  font-size: 1rem;
  color: #666666;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .help-support {
    padding: 1rem;
  }

  .content-container {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .feedback-grid {
    grid-template-columns: 1fr;
  }

  .feedback-section h2 {
    font-size: 2rem;
  }

  .feedback-card:nth-last-child(-n+2) {
    margin-bottom: 0;
  }

  .feedback-card:last-child {
    margin-bottom: -2rem;
  }

  .feedback-section {
    padding-bottom: 8rem;
  }
}
</style> 