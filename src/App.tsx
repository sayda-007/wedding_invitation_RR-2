import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { invitationData } from './data/invitationData'
import './royal-ornaments.css'

type CountdownState = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const sectionIds = [
  'cover',
  'couple',
  'event',
  'schedule',
  'countdown',
  'venue',
  'contacts',
  'closing',
] as const

type SectionId = (typeof sectionIds)[number]

const contactBengaliNames = [
  'মো: আব্দুস সাত্তার শেখ',
  'মো: সাজিদুল ইসলাম সাজিদ',
]

const sparkIds = Array.from({ length: 18 }, (_, index) => index)

const revealTransition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as const,
}

const revealViewport = {
  once: true,
  amount: 0.25,
}

const revealUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const revealLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
}

const revealRight = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
}

const revealScale = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
}

const formatValue = (value: number) => String(value).padStart(2, '0')

function App() {
  const prefersReducedMotion = useReducedMotion()

  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('cover')
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isEventReached, setIsEventReached] = useState(false)

  const openLockRef = useRef(false)
  const openTimerRef = useRef<number | null>(null)

  // The seal opens the gatefold once. The delay lets the light and sparkles finish.
  const openEnvelope = useCallback(() => {
    if (openLockRef.current) return

    openLockRef.current = true
    setIsOpening(true)

    if (prefersReducedMotion) {
      setIsEnvelopeOpen(true)
      setIsOpening(false)
      return
    }

    openTimerRef.current = window.setTimeout(() => {
      setIsEnvelopeOpen(true)
      setIsOpening(false)
      openTimerRef.current = null
    }, 1700)
  }, [prefersReducedMotion])

  useEffect(() => {
    return () => {
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current)
      }
    }
  }, [])

  // The eventDateTime value should include Bangladesh's UTC+06:00 offset.
  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = new Date(invitationData.eventDateTime)
      const difference = targetDate.getTime() - Date.now()

      if (!Number.isFinite(targetDate.getTime()) || difference <= 0) {
        setIsEventReached(true)
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const totalSeconds = Math.floor(difference / 1000)
      setIsEventReached(false)
      setCountdown({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      })
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [])

  // Keep the bottom navigation in sync with the visible page section.
  useEffect(() => {
    if (!isEnvelopeOpen) return

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) => second.intersectionRatio - first.intersectionRatio,
          )

        const visibleSection = visibleEntries[0]
        if (visibleSection?.target.id) {
          setActiveSection(visibleSection.target.id as SectionId)
        }
      },
      {
        root: null,
        threshold: [0.2, 0.4, 0.6],
        rootMargin: '-15% 0px -50% 0px',
      },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [isEnvelopeOpen])

  const currentIndex = sectionIds.indexOf(activeSection)
  const isLastSection = currentIndex === sectionIds.length - 1

  const scrollToSection = useCallback(
    (id: SectionId) => {
      document.getElementById(id)?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    },
    [prefersReducedMotion],
  )

  const moveToNextSection = useCallback(() => {
    if (isLastSection) {
      scrollToSection('cover')
      return
    }
    scrollToSection(sectionIds[currentIndex + 1])
  }, [currentIndex, isLastSection, scrollToSection])

  const venueName = invitationData.venue.name
  const venueAddress = invitationData.venue.address
  const venueBengaliName = invitationData.venue.bengaliName
  const motionDuration = prefersReducedMotion ? 0.01 : undefined

  return (
    <div className={`app-shell ${isEnvelopeOpen ? 'is-opened' : ''}`}>
      {/* OPENING GATEFOLD */}
      <AnimatePresence mode="wait">
        {!isEnvelopeOpen && (
          <motion.div
            key="sealed-card"
            className="envelope-stage"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: prefersReducedMotion ? 0.01 : 0.6 },
            }}
          >
            <div className="envelope-wrapper">
              <motion.div
                className={`envelope ${isOpening ? 'is-opening' : ''}`}
                initial={{ scale: 0.98, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0.01 : 0.5,
                  ease: 'easeOut',
                }}
              >
                <div className="envelope-texture" aria-hidden="true" />
                <div
                  className="envelope-ornament envelope-ornament-right"
                  aria-hidden="true"
                />
                <div className="envelope-shadow" aria-hidden="true" />

                <motion.div
                  className="envelope-panel left"
                  aria-hidden="true"
                  animate={
                    isOpening
                      ? { x: '-54%', rotateY: -72, rotateZ: -1.2 }
                      : { x: 0, rotateY: 0, rotateZ: 0 }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0.01 : 1.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />

                <motion.div
                  className="envelope-panel right"
                  aria-hidden="true"
                  animate={
                    isOpening
                      ? { x: '54%', rotateY: 72, rotateZ: 1.2 }
                      : { x: 0, rotateY: 0, rotateZ: 0 }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0.01 : 1.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />

                <div className="envelope-inner" aria-hidden="true">
                  <div className="inner-frame">
                    <span className="inner-orbit" />
                    <span className="inner-monogram">{invitationData.monogram}</span>
                  </div>
                </div>

                {/* CENTRAL GOLDEN LIGHT */}
                <motion.div
                  className="light-burst"
                  aria-hidden="true"
                  animate={
                    isOpening && !prefersReducedMotion
                      ? { opacity: [0, 1, 0.85], scale: [0.65, 1.5, 2.2] }
                      : { opacity: 0, scale: 0.65 }
                  }
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                >
                  <span className="light-ray ray-1" />
                  <span className="light-ray ray-2" />
                  <span className="light-ray ray-3" />
                  <span className="light-ray ray-4" />
                  <span className="light-ray ray-5" />
                  <span className="light-ray ray-6" />
                  <span className="light-core" />
                </motion.div>

                {/* OPENING SPARKLES */}
                <div className="spark-field" aria-hidden="true">
                  {sparkIds.map((sparkId) => (
                    <span
                      key={sparkId}
                      className={`spark spark-${sparkId + 1}`}
                    />
                  ))}
                </div>

                {/* WAX SEAL */}
                <div className="seal-cluster">
                  <motion.button
                    type="button"
                    className={`wax-seal ${isOpening ? 'seal-released' : ''}`}
                    aria-label="Open the invitation"
                    disabled={isOpening}
                    onClick={openEnvelope}
                    whileHover={
                      !isOpening && !prefersReducedMotion
                        ? { scale: 1.045 }
                        : undefined
                    }
                    whileTap={
                      !isOpening && !prefersReducedMotion
                        ? { scale: 0.96 }
                        : undefined
                    }
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 20,
                    }}
                  >
                    <span className="seal-rim" />
                    <span className="seal-rr">{invitationData.monogram}</span>
                    <span className="seal-glint" aria-hidden="true" />
                  </motion.button>

                  <motion.div
                    className="click-here"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: prefersReducedMotion ? 0 : 0.4,
                      duration: motionDuration ?? 0.6,
                    }}
                  >
                    click here
                    <span className="click-here-bengali">(এখানে চাপুন)</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN INVITATION */}
      <AnimatePresence>
        {isEnvelopeOpen && (
          <motion.main
            key="invitation-page"
            className="invitation-page"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
            transition={{
              duration: prefersReducedMotion ? 0.01 : 0.8,
              ease: 'easeOut',
            }}
          >
            <div className="page-sparkles" aria-hidden="true">
              <span className="sparkle sparkle-1" />
              <span className="sparkle sparkle-2" />
              <span className="sparkle sparkle-3" />
              <span className="sparkle sparkle-4" />
              <span className="sparkle sparkle-5" />
              <span className="sparkle sparkle-6" />
            </div>

            {/* FIRST PAGE — COVER */}
            <section id="cover" className="invitation-section cover-section">
              <div className="section-frame cover-frame">
                <div className="ornament ornament-top" aria-hidden="true" />

                <motion.p
                  className="bismillah"
                  dir="rtl"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    duration: motionDuration ?? 0.8,
                  }}
                >
                  بِسْمِ ٱللّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </motion.p>

                <motion.p
                  className="english-translation"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.1,
                    duration: motionDuration ?? 0.8,
                  }}
                >
                  In the name of Allah, the Most Gracious, the Most Merciful.
                </motion.p>

                <motion.div
                  className="welcome-header"
                  variants={revealScale}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.15,
                    duration: motionDuration ?? 0.8,
                  }}
                >
                  <div className="mini-knot">RR</div>

                  <div className="occasion-title">
                    <span className="occasion-tag">
                      WEDDING RECEPTION
                    </span>
                    <span className="occasion-bengali">(বৌভাত)</span>
                  </div>
                </motion.div>

                <motion.div
                  className="invitation-greeting"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.22,
                    duration: motionDuration ?? 0.8,
                  }}
                >
                  <p className="invitation-greeting-english">
                    A warm invitation to you.
                  </p>
                  <p className="invitation-greeting-bengali">
                    আপনাকে সাদর আমন্ত্রণ
                  </p>
                </motion.div>

                <motion.p
                  className="welcome-message"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.3,
                    duration: motionDuration ?? 0.8,
                  }}
                >
                  With heartfelt joy and gratitude, we invite you to witness
                  the Wedding Reception celebration and share in the blessings of this
                  new chapter.
                </motion.p>

                <div className="ornament ornament-bottom" aria-hidden="true" />
              </div>
            </section>

            {/* SECOND PAGE — THE COUPLE */}
            <section id="couple" className="invitation-section couple-section">
              <div className="section-frame couple-frame">
                <motion.div
                  className="section-heading"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={revealTransition}
                >
                  The Couple
                </motion.div>

                <div className="names-wrapper">
                  <div className="name-block groom-name">
                    <motion.span
                      className="name-label"
                      variants={revealLeft}
                      initial="hidden"
                      whileInView="visible"
                      viewport={revealViewport}
                      transition={{
                        ...revealTransition,
                        delay: prefersReducedMotion ? 0 : 0.08,
                      }}
                    >
                      Groom
                    </motion.span>

                    <motion.h2
                      className="animated-name"
                      variants={revealLeft}
                      initial="hidden"
                      whileInView="visible"
                      viewport={revealViewport}
                      transition={{
                        ...revealTransition,
                        delay: prefersReducedMotion ? 0 : 0.16,
                      }}
                    >
                      <span>{invitationData.groom}</span>
                    </motion.h2>

                    <motion.p
                      className="couple-bengali-name"
                      variants={revealLeft}
                      initial="hidden"
                      whileInView="visible"
                      viewport={revealViewport}
                      transition={{
                        ...revealTransition,
                        delay: prefersReducedMotion ? 0 : 0.24,
                      }}
                    >
                      মোঃ রফিকুল ইসলাম (পিন্টু)
                    </motion.p>
                  </div>

                  <motion.div
                    className="monogram-mark"
                    aria-label="RR monogram"
                    variants={revealScale}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    transition={{
                      ...revealTransition,
                      delay: prefersReducedMotion ? 0 : 0.2,
                    }}
                  >
                    {invitationData.monogram}
                  </motion.div>

                  <div className="name-block bride-name">
                    <motion.span
                      className="name-label"
                      variants={revealRight}
                      initial="hidden"
                      whileInView="visible"
                      viewport={revealViewport}
                      transition={{
                        ...revealTransition,
                        delay: prefersReducedMotion ? 0 : 0.08,
                      }}
                    >
                      Bride
                    </motion.span>

                    <motion.h2
                      className="animated-name"
                      variants={revealRight}
                      initial="hidden"
                      whileInView="visible"
                      viewport={revealViewport}
                      transition={{
                        ...revealTransition,
                        delay: prefersReducedMotion ? 0 : 0.16,
                      }}
                    >
                      <span>{invitationData.bride}</span>
                    </motion.h2>

                    <motion.p
                      className="couple-bengali-name"
                      variants={revealRight}
                      initial="hidden"
                      whileInView="visible"
                      viewport={revealViewport}
                      transition={{
                        ...revealTransition,
                        delay: prefersReducedMotion ? 0 : 0.24,
                      }}
                    >
                      রূপালী আক্তার
                    </motion.p>
                  </div>
                </div>
              </div>
            </section>

            {/* THIRD PAGE — EVENT DATE */}
            <section id="event" className="invitation-section event-section">
              <div className="section-frame event-box">
                <motion.div
                  className="section-heading"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={revealTransition}
                >
                  The Wedding Reception Celebration
                </motion.div>

                <div className="event-details">
                  <motion.p
                    className="event-date"
                    variants={revealUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    transition={{
                      ...revealTransition,
                      delay: prefersReducedMotion ? 0 : 0.1,
                    }}
                  >
                    16 JANUARY 2027
                  </motion.p>

                  <motion.p
                    className="event-weekday"
                    variants={revealUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    transition={{
                      ...revealTransition,
                      delay: prefersReducedMotion ? 0 : 0.16,
                    }}
                  >
                    SATURDAY
                  </motion.p>

                  <motion.p
                    className="event-bengali-date"
                    variants={revealUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    transition={{
                      ...revealTransition,
                      delay: prefersReducedMotion ? 0 : 0.22,
                    }}
                  >
                    শনিবার, ২ মাঘ, ১৪৩৩ বঙ্গাব্দ
                  </motion.p>

                  <motion.p
                    className="event-hijri-date"
                    variants={revealUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    transition={{
                      ...revealTransition,
                      delay: prefersReducedMotion ? 0 : 0.28,
                    }}
                  >
                    ৮ শাবান, ১৪৪৮ হিজরি
                  </motion.p>

                  <motion.p
                    className="event-day-banner"
                    variants={revealUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    transition={{
                      ...revealTransition,
                      delay: prefersReducedMotion ? 0 : 0.34,
                    }}
                  >
                    A gathering of family, love, and gratitude.
                  </motion.p>
                </div>
              </div>
            </section>

            {/* FOURTH PAGE — PROGRAMME */}
            <section id="schedule" className="invitation-section schedule-section">
              <div className="section-frame">
                <motion.div
                  className="section-heading"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={revealTransition}
                >
                  Programme
                </motion.div>

                <div className="timeline">
                  <motion.div
                    className="timeline-item"
                    variants={revealScale}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    transition={{
                      ...revealTransition,
                      delay: prefersReducedMotion ? 0 : 0.12,
                    }}
                  >
                    <span className="time">1:00 PM</span>
                    <span className="dot" aria-hidden="true" />
                    <div className="timeline-copy">
                      <span className="label">Feast Begins</span>
                      <span className="timeline-bengali">
                        (দুপুর ১টায় ভোজ শুরু হবে।)
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* FIFTH PAGE — COUNTDOWN (UNCHANGED) */}
            <section id="countdown" className="invitation-section countdown-section">
              <div className="section-frame countdown-box">
                <motion.div
                  className="section-heading"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={revealTransition}
                >
                  Countdown
                </motion.div>

                {isEventReached ? (
                  <motion.p
                    className="event-day-banner"
                    variants={revealUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    transition={revealTransition}
                  >
                    The blessed day has arrived. We are grateful for your
                    presence.
                  </motion.p>
                ) : (
                  <div
                    className="countdown-grid"
                    aria-label="Countdown to the Wedding Reception celebration"
                    aria-live="off"
                  >
                    {[
                      { value: countdown.days, label: 'Days' },
                      { value: countdown.hours, label: 'Hours' },
                      { value: countdown.minutes, label: 'Minutes' },
                      { value: countdown.seconds, label: 'Seconds' },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="count-box"
                        variants={revealScale}
                        initial="hidden"
                        whileInView="visible"
                        viewport={revealViewport}
                        transition={{
                          ...revealTransition,
                          delay: prefersReducedMotion ? 0 : index * 0.09,
                        }}
                      >
                        <span className="value">{formatValue(item.value)}</span>
                        <span className="unit">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* SIXTH PAGE — VENUE (UNCHANGED) */}
            <section id="venue" className="invitation-section venue-section">
              <div className="section-frame venue-box">
                <motion.div
                  className="section-heading"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={revealTransition}
                >
                  Venue &amp; Location
                </motion.div>

                <div className="venue-layout">
                  <motion.div
                    className="venue-image-frame"
                    variants={revealLeft}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    transition={{
                      ...revealTransition,
                      delay: prefersReducedMotion ? 0 : 0.08,
                    }}
                  >
                    <img
                      src={invitationData.venue.image}
                      alt="Royal venue entrance gate photographed for the Wedding Reception invitation"
                      loading="lazy"
                    />
                  </motion.div>

                  <motion.div
                    className="venue-copy"
                    variants={revealRight}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    transition={{
                      ...revealTransition,
                      delay: prefersReducedMotion ? 0 : 0.14,
                    }}
                  >
                    <div className="location-icon" aria-hidden="true">⌖</div>
                    <h3 className="venue-name">{venueName}</h3>
                    <p className="venue-address">{venueAddress}</p>
                    <p className="venue-bengali-name">({venueBengaliName})</p>
                    <a
                      href={invitationData.venue.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="map-link"
                    >
                      Open in Google Maps
                    </a>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* SEVENTH PAGE — CONTACTS */}
            <section id="contacts" className="invitation-section contacts-section">
              <div className="section-frame">
                <motion.div
                  className="section-heading"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={revealTransition}
                >
                  Contact
                </motion.div>

                <div className="contact-list">
                  {invitationData.contacts.map((person, index) => (
                    <motion.a
                      key={person.phone}
                      href={`tel:${person.phone}`}
                      className="contact-item"
                      variants={revealUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={revealViewport}
                      transition={{
                        ...revealTransition,
                        delay: prefersReducedMotion ? 0 : index * 0.12,
                      }}
                    >
                      <span className="phone-icon" aria-hidden="true">☎</span>
                      <div className="contact-copy">
                        <strong>{person.name}</strong>
                        {contactBengaliNames[index] && (
                          <span className="contact-bengali-name">
                            ({contactBengaliNames[index]})
                          </span>
                        )}
                        <span className="contact-number">{person.phone}</span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </section>

            {/* EIGHTH PAGE — CLOSING DUA */}
            <section id="closing" className="invitation-section closing-section">
              <div className="section-frame closing-box">
                <motion.div
                  className="section-heading"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={revealTransition}
                >
                  Dua
                </motion.div>

                <motion.p
                  className="dua-text arabic"
                  dir="rtl"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.08,
                  }}
                >
                  بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
                </motion.p>

                <motion.p
                  className="dua-text english"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.14,
                  }}
                >
                  May Allah bless you, shower His blessings upon you, and
                  unite you both in goodness.
                </motion.p>

                <motion.p
                  className="dua-bengali"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.2,
                  }}
                >
                  আল্লাহ আপনাকে বরকত দান করুন, আপনার ওপর তাঁর বরকত নাজিল
                  করুন এবং আপনাদের দুজনকে কল্যাণের সঙ্গে একত্রিত রাখুন।
                </motion.p>

                <motion.p
                  className="dua-reference"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.25,
                  }}
                >
                  Jami' at-Tirmidhi 1091
                </motion.p>

                <motion.div
                  className="closing-ornament"
                  aria-hidden="true"
                  initial={{ opacity: 0, scaleX: 0.7 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.3,
                  }}
                />

                <motion.p
                  className="final-message"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.34,
                  }}
                >
                  Your presence will make our joy complete. Insha’Allah.
                </motion.p>

                <motion.p
                  className="final-message bangla"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.4,
                  }}
                >
                  আপনার উপস্থিতি আমাদের আনন্দকে পূর্ণতা দেবে, ইনশাআল্লাহ।
                </motion.p>

                <motion.p
                  className="warm-welcome"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.46,
                  }}
                >
                  Warm welcome by Md. Saifan Sadaf and family.
                </motion.p>

                <motion.p
                  className="warm-welcome-bengali"
                  variants={revealUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={revealViewport}
                  transition={{
                    ...revealTransition,
                    delay: prefersReducedMotion ? 0 : 0.52,
                  }}
                >
                  (মোঃ সাঈফান সাদাফ ও পরিবারের পক্ষ থেকে উষ্ণ অভ্যর্থনা)
                </motion.p>
              </div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>

      {/* SECTION NAVIGATION */}
      {isEnvelopeOpen && (
        <motion.button
          type="button"
          className="bottom-nav"
          aria-label={
            isLastSection ? 'Return to the top' : 'Scroll to the next section'
          }
          onClick={moveToNextSection}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.35 }}
        >
          {isLastSection ? '↑' : '↓'}
        </motion.button>
      )}
    </div>
  )
}

export default App
