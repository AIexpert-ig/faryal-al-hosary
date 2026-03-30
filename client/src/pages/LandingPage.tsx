import Hero from '../components/Hero';
import IntroGrid from '../components/IntroGrid';
import FeaturedProjects from '../components/FeaturedProjects';
import Services from '../components/Services';
import WhyChoose from '../components/WhyChoose';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <IntroGrid />
      <FeaturedProjects />
      <Services />
      <WhyChoose />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
