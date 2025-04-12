<script>
import { useUserStore } from "@/stores/user";
import nimbusLogo from "@/assets/icons/logo.svg";

export default {
  data() {
    return {
      nimbusLogo,
    };
  },
  computed: {
    store() {
      return useUserStore();
    },
  },
};
</script>

<template>
  <main class="legal-resources">
    <div class="legal-header">
      <h1 class="text-left">Legal Insights: Navigating Digital Weather Services</h1>
    </div>

    <section class="user-conduct">
      <h2 class="text-left">USER CONDUCT POLICY</h2>
      <p class="text-left">
        Join our Nimbus community with respect and kindness at heart. Our policy promotes
        positive interactions, celebrating the sunny and the stormy days alike. Let's create a
        climate of support and understanding, where every member feels like part of the Nimbus
        family.
      </p>
    </section>

    <section class="policy-items">
      <div class="policy-item">
        <div class="number-container">
          <span class="number">01</span>
        </div>
        <div class="content">
          <h3>Illegal Activities</h3>
          <p>
            Within the Nimbus horizon, there's no room for
            the shadowy clouds of unlawful behavior. We
            strive for transparency and legality, ensuring
            that every breeze within our platform is as fresh
            and clear as a perfect spring day.
          </p>
        </div>
      </div>

      <div class="policy-item reverse">
        <div class="content text-right">
          <h3>Hate Speech</h3>
          <p>
            In our Nimbus world, every word is like a raindrop –
            it should nourish, not erode. We stand firm against
            the stormy winds of hate speech, fostering an
            environment where every voice contributes to a
            harmonious climate.
          </p>
        </div>
        <div class="number-container">
          <span class="number">02</span>
        </div>
      </div>

      <div class="policy-item">
        <div class="number-container">
          <span class="number">03</span>
        </div>
        <div class="content">
          <h3>Personal and Confidential Info</h3>
          <p>
            Your privacy is a sanctuary we vow to protect like
            the precious atmosphere itself. At Nimbus,
            safeguarding your personal and confidential
            information is as vital to us as forecasting the next
            day's weather with precision and care.
          </p>
        </div>
      </div>
    </section>

    <section class="additional-info">
      <h3>About our policies and terms</h3>
      <p>
        These policies apply generally to the content on Project Shield. Some Services have their
        own separate policies that can be found within those Services and apply to your use of
        them. All Services are governed by their applicable terms of service.
      </p>
    </section>

    <section class="reporting">
      <h3>Reporting Potential Issues</h3>
      <p>
        If you encounter content or a user that you believe violates the above policies, please
        <a href="https://help.projectshield.withgoogle.com/s/" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="report-link">report it to us</a>.
      </p>
    </section>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <div class="link-item">
            <div class="dot red"></div>
            <RouterLink to="/legalResources">legal resources</RouterLink>
          </div>
          <div class="link-item">
            <div class="dot pink"></div>
            <RouterLink to="/additionalInformation">additional info</RouterLink>
          </div>
        </div>
        <div class="logo-section">
          <h2 class="nimbus-text">nimbus</h2>
        </div>
      </div>
      <div class="footer-decoration">
        <div class="semicircle"></div>
        <div class="semicircle"></div>
        <div class="semicircle"></div>
        <div class="semicircle"></div>
      </div>
    </footer>
  </main>
</template>

<style scoped>
.legal-resources {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  font-family: 'Asap', sans-serif;
}

.legal-header {
  text-align: center;
  margin-bottom: 3rem;
}

.legal-header h1 {
  font-family: 'Recoleta', serif;
  color: #303030;
  font-size: 2.5rem;
  font-weight: 700;
  max-width: 800px;
  margin: 0 auto;
}

.user-conduct {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
}

.user-conduct h2 {
  font-family: 'Asap', sans-serif;
  color: #303030;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.user-conduct p {
  color: #303030;
  line-height: 1.6;
}

.policy-items {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.policy-item {
  display: flex;
  align-items: flex-start;
  gap: 3rem;
  padding: 2rem;
  background: #F9EFE9;
  border-radius: 30px;
  position: relative;
  overflow: hidden;
}

.policy-item.reverse {
  flex-direction: row-reverse;
}

.number-container {
  position: relative;
  height: 120px;
  display: flex;
  align-items: flex-end;
  flex-shrink: 0;
}

.number {
  font-family: 'Recoleta', serif;
  font-size: 8rem;
  font-weight: 700;
  color: #303030;
  line-height: 1;
  margin-top: -2rem; /* Creates the cut-off effect */
}

.content {
  flex: 1;
  padding-top: 1rem;
}

.content h3 {
  font-family: 'Asap', sans-serif;
  color: #303030;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.content p {
  color: #303030;
  line-height: 1.6;
  font-size: 1.1rem;
}

.text-right {
  text-align: right;
}

.additional-info,
.reporting {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem 0;
  border-top: 1px solid rgba(48, 48, 48, 0.2);
}

.additional-info h3,
.reporting h3 {
  font-family: 'Asap', sans-serif;
  color: #303030;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.report-link {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.report-link:hover {
  color: #388E3C;
  text-decoration: underline;
}

/* Add focus styles for accessibility */
.report-link:focus {
  outline: 2px solid #4CAF50;
  outline-offset: 2px;
}

.footer {
  width: 100%;
  position: relative;
  margin-top: 4rem;
}

.footer-content {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: start;
  padding: 1rem 3rem;

}

.footer-links {
  display: flex;
  gap: 2rem;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.red {
  background-color: #FF5C5C;
}

.dot.pink {
  background-color: #FF9ECD;
}

.footer-links a {
  color: #303030;
  text-decoration: none;
  font-family: 'Recoleta', serif;
  font-size: 1.3rem;
  font-weight: 700;
}

.logo-section {
  display: flex;
  align-items: center;
}

.nimbus-text {
  font-family: 'Recoleta', serif;
  font-size: 5rem;
  font-weight: 700;
  color: #303030;
  margin: 0;
  z-index: 2; 
}

.footer-decoration {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: absolute;
  bottom: -50px;

}

.semicircle {
  width: 220px;
  height: 100px;
  background-color: #EEB083;
  border-radius: 100px 100px 0 0;
}

.text-left {
  text-align: left !important;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .footer-links {
    flex-direction: column;
    align-items: center;
  }

  .semicircle {
    width: 60px;
    height: 30px;
  }

  .policy-item,
  .policy-item.reverse {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
  }

  .number-container {
    height: 80px;
  }

  .number {
    font-size: 5rem;
    margin-top: -1rem;
  }

  .content,
  .text-right {
    text-align: left;
  }

  .content h3 {
    font-size: 1.5rem;
  }
}
</style>