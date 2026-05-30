// ============================================================
// DIPLOMATIQ — MUN OFFICIAL CODE OF CONDUCT
// Version 2.0 — Effective September 2026
// 36 Mandatory Sections with Comprehensive Rules
// ============================================================

export type Severity = 'mandatory' | 'important' | 'recommended'

export interface ConductRule {
  number: string
  text: string
  severity: Severity
}

export interface ConductSection {
  id: string
  title: string
  icon: string
  description: string
  rules: ConductRule[]
}

export const CODE_OF_CONDUCT_VERSION = '2.0'
export const CODE_OF_CONDUCT_EFFECTIVE = 'September 2026'
export const TOTAL_SECTIONS = 36

export const INTRODUCTION =
  "The DiplomatiQ Code of Conduct establishes the standards of behavior, professionalism, integrity, diplomacy, and respect expected of all participants using the platform and participating in Model United Nations activities, conferences, committees, simulations, training programs, and educational events. By accessing the DiplomatiQ platform, every user acknowledges and agrees to be bound by all 36 sections of this Code."

export const SECTIONS: ConductSection[] = [
  // ══════════════════════════════════════════════
  // 1. GENERAL CONDUCT & DECORUM
  // ══════════════════════════════════════════════
  {
    id: 'general-conduct-decorum',
    title: 'General Conduct & Decorum',
    icon: 'Shield',
    description: 'Foundational standards of behavior and professional decorum for all DiplomatiQ participants.',
    rules: [
      { number: '1.1', text: 'All participants shall uphold the values of the United Nations, including respect for human rights, dignity, international cooperation, and the peaceful resolution of disputes.', severity: 'mandatory' },
      { number: '1.2', text: 'Delegates shall represent their assigned country\'s position accurately and professionally, even when it differs from their personal opinions or beliefs.', severity: 'mandatory' },
      { number: '1.3', text: 'Participants shall treat fellow delegates, chairs, advisors, teachers, administrators, and platform users with courtesy, professionalism, and respect at all times.', severity: 'mandatory' },
      { number: '1.4', text: 'Academic integrity is paramount. Plagiarism, fabrication of sources, misrepresentation of information, and dishonest conduct are strictly prohibited.', severity: 'mandatory' },
      { number: '1.5', text: 'All participants shall contribute to creating an inclusive, welcoming environment free from discrimination based on nationality, ethnicity, race, religion, gender, disability, language, or socioeconomic background.', severity: 'mandatory' },
      { number: '1.6', text: 'Participants shall conduct themselves in a manner that reflects positively upon their school, institution, conference, and the wider MUN community.', severity: 'important' },
      { number: '1.7', text: 'The principles of diplomatic conduct extend to all interactions — both formal committee sessions and informal exchanges, whether in-person or digital.', severity: 'mandatory' },
      { number: '1.8', text: 'No participant shall use their position, influence, or authority to coerce, manipulate, or intimidate another participant for any purpose.', severity: 'mandatory' },
      { number: '1.9', text: 'Participants shall respect the confidentiality of sensitive information shared during committee sessions, crisis simulations, and private diplomatic negotiations unless disclosure is required for safety or legal compliance.', severity: 'important' },
      { number: '1.10', text: 'The spirit of Model United Nations is educational. Participants shall prioritize learning, growth, and collaboration over competitive advantage at the expense of others.', severity: 'important' },
      { number: '1.11', text: 'All participants acknowledge that MUN is a simulation designed to develop skills and understanding. Actions taken in simulation do not represent real-world political positions or endorsements.', severity: 'recommended' },
      { number: '1.12', text: 'Participants shall not misrepresent their identity, qualifications, school affiliation, or any other material fact when registering for or participating in any MUN activity.', severity: 'mandatory' },
      { number: '1.13', text: 'Constructive disagreement is foundational to diplomacy. Participants are encouraged to challenge ideas vigorously while respecting the individuals who hold them.', severity: 'recommended' },
      { number: '1.14', text: 'All participants have a responsibility to report violations of this Code of Conduct through the appropriate channels without fear of retaliation.', severity: 'mandatory' },
      { number: '1.15', text: 'Ignorance of this Code of Conduct does not excuse violations. All participants are expected to read, understand, and abide by its provisions.', severity: 'mandatory' },
      { number: '1.16', text: 'This Code of Conduct applies to all DiplomatiQ platform activities, including assessments, training courses, conference management, research submissions, chat communications, and video sessions.', severity: 'mandatory' },
      { number: '1.17', text: 'Participants shall not engage in any activity that undermines the educational purpose, integrity, or reputation of the DiplomatiQ platform or the Model United Nations community.', severity: 'mandatory' },
      { number: '1.18', text: 'Cultural, religious, and personal differences shall be respected at all times. What may be acceptable in one cultural context may be offensive in another; participants shall exercise cultural sensitivity.', severity: 'important' },
      { number: '1.19', text: 'Participants shall comply with all applicable local, national, and international laws, including those relating to data protection, intellectual property, and online conduct.', severity: 'mandatory' },
      { number: '1.20', text: 'The DiplomatiQ platform reserves the right to update this Code of Conduct. Participants will be notified of material changes and are bound by the most current version.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 2. REGISTRATION & IDENTITY
  // ══════════════════════════════════════════════
  {
    id: 'registration-identity',
    title: 'Registration & Identity',
    icon: 'UserCheck',
    description: 'Rules governing account registration, identity verification, and profile management on DiplomatiQ.',
    rules: [
      { number: '2.1', text: 'All participants must register with their full legal name as it appears on their official identification documents.', severity: 'mandatory' },
      { number: '2.2', text: 'Each participant may maintain only one active account on the DiplomatiQ platform. Duplicate accounts are prohibited and will be deactivated.', severity: 'mandatory' },
      { number: '2.3', text: 'Participants must provide accurate and current information during registration, including school affiliation, grade level, and contact details.', severity: 'mandatory' },
      { number: '2.4', text: 'Account credentials (username and password) must not be shared with any other person, including teammates, advisors, or family members.', severity: 'mandatory' },
      { number: '2.5', text: 'Participants shall not impersonate another individual, create accounts under false pretenses, or use another person\'s account under any circumstances.', severity: 'mandatory' },
      { number: '2.6', text: 'Students under the age of 13 must have parental or guardian consent to register, in compliance with applicable child privacy laws.', severity: 'mandatory' },
      { number: '2.7', text: 'Profile photos must be a recent, recognizable photograph of the account holder. Avatars, memes, or images of other individuals are not permitted.', severity: 'important' },
      { number: '2.8', text: 'Participants shall update their profile information promptly when any material changes occur, such as school transfer or contact detail changes.', severity: 'recommended' },
      { number: '2.9', text: 'The platform reserves the right to verify the identity of any account holder and to request documentation as proof of identity or institutional affiliation.', severity: 'mandatory' },
      { number: '2.10', text: 'Accounts found to be registered with fraudulent information will be permanently suspended, and the individual may be barred from future registration.', severity: 'mandatory' },
      { number: '2.11', text: 'Participants shall not use VPNs, proxies, or other tools to circumvent geographic restrictions or access region-locked content on the platform.', severity: 'important' },
      { number: '2.12', text: 'Former participants whose accounts have been suspended or banned shall not attempt to create new accounts without explicit written authorization from platform administration.', severity: 'mandatory' },
      { number: '2.13', text: 'Registration for conferences must be completed through official channels only. Third-party registration services or intermediaries are not authorized.', severity: 'mandatory' },
      { number: '2.14', text: 'Participants shall verify their email address within 48 hours of registration. Unverified accounts may be subject to limited functionality.', severity: 'important' },
      { number: '2.15', text: 'School administrators and teachers may verify student accounts linked to their institution and are responsible for validating enrollment claims.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 3. CREDENTIALS & ACCESS
  // ══════════════════════════════════════════════
  {
    id: 'credentials-access',
    title: 'Credentials & Access',
    icon: 'KeyRound',
    description: 'Standards for managing access credentials, authentication, and authorization across the DiplomatiQ platform.',
    rules: [
      { number: '3.1', text: 'Passwords must be at least 10 characters in length and include a combination of uppercase letters, lowercase letters, numbers, and special characters.', severity: 'mandatory' },
      { number: '3.2', text: 'Participants shall enable two-factor authentication (2FA) when available to secure their accounts against unauthorized access.', severity: 'important' },
      { number: '3.3', text: 'Access tokens, session cookies, and API keys must not be shared, stored in plaintext, or committed to version control repositories.', severity: 'mandatory' },
      { number: '3.4', text: 'Participants shall not attempt to access restricted areas of the platform, administrative panels, or other users\' data without proper authorization.', severity: 'mandatory' },
      { number: '3.5', text: 'Suspicious account activity, including unrecognized login attempts or unauthorized access, must be reported to platform security immediately.', severity: 'mandatory' },
      { number: '3.6', text: 'Conference-specific credentials (delegate badges, access passes) are non-transferable and must be worn visibly during all official events.', severity: 'mandatory' },
      { number: '3.7', text: 'Digital conference access links are for the registered delegate only and shall not be distributed to unauthorized individuals.', severity: 'mandatory' },
      { number: '3.8', text: 'Participants shall log out from shared or public devices after each session to prevent unauthorized access to their accounts.', severity: 'important' },
      { number: '3.9', text: 'Role-based access controls must be respected. Students shall not attempt to access teacher or administrator features, and vice versa.', severity: 'mandatory' },
      { number: '3.10', text: 'Credentials issued for specific conferences expire at the conclusion of that conference and shall not be used for unauthorized access to future events.', severity: 'important' },
      { number: '3.11', text: 'Lost or compromised credentials must be reported within 24 hours. The platform will issue replacement credentials after identity verification.', severity: 'mandatory' },
      { number: '3.12', text: 'Guest or observer access is limited to designated areas and features. Guests shall not attempt to participate in restricted committee activities.', severity: 'important' },
      { number: '3.13', text: 'Automated scripts, bots, or scraping tools shall not be used to access or extract data from the DiplomatiQ platform.', severity: 'mandatory' },
      { number: '3.14', text: 'Expired or inactive accounts will be deactivated after 12 months of inactivity. Users may request reactivation through support.', severity: 'recommended' },
      { number: '3.15', text: 'Institutional administrators are responsible for managing access permissions for users within their organization and removing access for departed members.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 4. ACADEMIC INTEGRITY
  // ══════════════════════════════════════════════
  {
    id: 'academic-integrity',
    title: 'Academic Integrity',
    icon: 'Scale',
    description: 'Foundational academic honesty standards governing all submitted work and scholarly activity.',
    rules: [
      { number: '4.1', text: 'All work submitted through the platform — including position papers, resolutions, research briefs, and assessments — must be the original work of the submitting delegate.', severity: 'mandatory' },
      { number: '4.2', text: 'Plagiarism, defined as presenting another person\'s words, ideas, or work as one\'s own without proper attribution, is strictly prohibited and constitutes a serious violation.', severity: 'mandatory' },
      { number: '4.3', text: 'Fabrication of sources, statistics, quotations, or any other information is prohibited. All cited information must be verifiable from legitimate sources.', severity: 'mandatory' },
      { number: '4.4', text: 'Self-plagiarism — submitting work previously completed for another course or conference without disclosure — is prohibited.', severity: 'important' },
      { number: '4.5', text: 'Collaboration on individual assignments is not permitted unless explicitly authorized. Group work must clearly identify each contributor\'s role.', severity: 'mandatory' },
      { number: '4.6', text: 'All sources must be properly cited using a recognized citation format (MLA, APA, or Chicago) as specified by the conference or course requirements.', severity: 'mandatory' },
      { number: '4.7', text: 'Paraphrasing without attribution constitutes plagiarism. Delegates must acknowledge the source even when rephrasing another\'s ideas.', severity: 'mandatory' },
      { number: '4.8', text: 'The use of essay mills, paper-writing services, or paid research assistance is strictly prohibited.', severity: 'mandatory' },
      { number: '4.9', text: 'Delegates shall not share their completed work with others for the purpose of enabling plagiarism or academic dishonesty.', severity: 'mandatory' },
      { number: '4.10', text: 'Violations of academic integrity will result in a score of zero for the affected work, potential disqualification from the conference, and notification of the delegate\'s school.', severity: 'mandatory' },
      { number: '4.11', text: 'Delegates who become aware of academic dishonesty by others have an obligation to report it to the appropriate authority.', severity: 'important' },
      { number: '4.12', text: 'Fair use of brief quotations with proper citation is acceptable and encouraged to support arguments with authoritative sources.', severity: 'recommended' },
      { number: '4.13', text: 'Research assistance from teachers, parents, or tutors is permissible for guidance and feedback, but the intellectual work and writing must remain the student\'s own.', severity: 'important' },
      { number: '4.14', text: 'Translation of foreign-language sources must be the delegate\'s own work or properly attributed to the translation tool used.', severity: 'important' },
      { number: '4.15', text: 'The DiplomatiQ platform employs AI-powered plagiarism and originality detection. Delegates consent to their work being analyzed by these systems upon submission.', severity: 'mandatory' },
      { number: '4.16', text: 'Resubmission of work that has been substantially modified after a previous rejection must be disclosed as a revised submission.', severity: 'recommended' },
      { number: '4.17', text: 'Data manipulation or selective reporting of research findings to misrepresent outcomes constitutes academic misconduct.', severity: 'mandatory' },
      { number: '4.18', text: 'Delegates shall not use image manipulation or data fabrication to create false evidence for their arguments in committee or written submissions.', severity: 'mandatory' },
    ],
  },

  // ══════════════════════════════════════════════
  // 5. PLAGIARISM & ORIGINAL WORK
  // ══════════════════════════════════════════════
  {
    id: 'plagiarism-original-work',
    title: 'Plagiarism & Original Work',
    icon: 'FileWarning',
    description: 'Detailed policies on plagiarism detection, originality standards, and consequences for misrepresentation.',
    rules: [
      { number: '5.1', text: 'The DiplomatiQ platform defines plagiarism as any unattributed use of another person\'s words, ideas, data, images, or creative work, whether published or unpublished.', severity: 'mandatory' },
      { number: '5.2', text: 'Direct quotations must be enclosed in quotation marks and attributed to the original source with a complete citation.', severity: 'mandatory' },
      { number: '5.3', text: 'Indirect quotation (paraphrasing) requires attribution even when the words are entirely the delegate\'s own. The source of the idea must be credited.', severity: 'mandatory' },
      { number: '5.4', text: 'Patchwriting — substituting individual words in a copied passage while retaining the original structure — constitutes plagiarism regardless of minor word changes.', severity: 'mandatory' },
      { number: '5.5', text: 'Mosaic plagiarism — assembling content from multiple sources without proper attribution of each source — is prohibited.', severity: 'mandatory' },
      { number: '5.6', text: 'Copying another delegate\'s position paper, resolution, or speech — in whole or in part — is a serious violation, even if the original author consents.', severity: 'mandatory' },
      { number: '5.7', text: 'Using real United Nations resolutions as the basis for MUN resolutions is acceptable, but verbatim copying of operative clauses without original contribution is prohibited.', severity: 'important' },
      { number: '5.8', text: 'The platform\'s originality detection system will flag submissions with less than 70% original content for review. Delegates will be notified and given the opportunity to revise.', severity: 'important' },
      { number: '5.9', text: 'Common knowledge (widely known facts that can be found in multiple general reference sources) does not require citation, but specific interpretations or analyses of common knowledge do.', severity: 'recommended' },
      { number: '5.10', text: 'Visual content (charts, graphs, photographs, diagrams) copied from external sources requires attribution to the original creator or source.', severity: 'mandatory' },
      { number: '5.11', text: 'Collaborative works must include a contribution statement identifying each collaborator\'s specific contributions to the final product.', severity: 'important' },
      { number: '5.12', text: 'Accidental plagiarism due to careless note-taking or forgotten citations is still a violation. Delegates are responsible for maintaining rigorous citation practices.', severity: 'important' },
      { number: '5.13', text: 'First-time plagiarism violations will result in a warning and requirement to resubmit. Repeat violations will result in escalating penalties including disqualification.', severity: 'mandatory' },
      { number: '5.14', text: 'Delegates may appeal plagiarism findings through the formal appeals process if they believe the detection was in error.', severity: 'recommended' },
    ],
  },

  // ══════════════════════════════════════════════
  // 6. AI CONTENT USAGE POLICY
  // ══════════════════════════════════════════════
  {
    id: 'ai-content-usage',
    title: 'AI Content Usage Policy',
    icon: 'Brain',
    description: 'Governance of artificial intelligence tools for research, writing, and content generation on the platform.',
    rules: [
      { number: '6.1', text: 'Artificial intelligence tools may be used as research and writing aids, provided their use is disclosed and the maximum acceptable AI contribution does not exceed 25% of any submitted work.', severity: 'mandatory' },
      { number: '6.2', text: 'AI-generated content presented as entirely original work without disclosure constitutes a violation of academic integrity, regardless of the quality of the output.', severity: 'mandatory' },
      { number: '6.3', text: 'Acceptable uses of AI include: brainstorming ideas, checking grammar and spelling, generating outlines, finding relevant sources, and exploring alternative perspectives.', severity: 'important' },
      { number: '6.4', text: 'Prohibited uses of AI include: generating complete position papers, resolutions, or speeches; fabricating sources or citations; and producing substantive analytical content presented as the delegate\'s own work.', severity: 'mandatory' },
      { number: '6.5', text: 'Delegates must indicate which portions of their work were developed with AI assistance by including an "AI Disclosure Statement" with any submission.', severity: 'mandatory' },
      { number: '6.6', text: 'The DiplomatiQ Research Lab\'s AI evaluation system will analyze submissions for AI-generated content. Delegates consent to this analysis upon submission.', severity: 'mandatory' },
      { number: '6.7', text: 'If AI content exceeds the 25% threshold, the delegate will be notified and given the opportunity to revise and resubmit before any disciplinary action.', severity: 'important' },
      { number: '6.8', text: 'AI tools shall not be used to impersonate another person, generate deepfake content, or create misleading materials of any kind.', severity: 'mandatory' },
      { number: '6.9', text: 'Delegates shall not use AI to generate fake citations, fabricated statistics, or invented sources that do not exist.', severity: 'mandatory' },
      { number: '6.10', text: 'The use of AI during live assessments is prohibited unless explicitly permitted by the assessment instructions.', severity: 'mandatory' },
      { number: '6.11', text: 'AI-assisted translation is permitted, but delegates must disclose its use and take responsibility for the accuracy of the translated content.', severity: 'important' },
      { number: '6.12', text: 'Delegates shall not input confidential or personal information about other participants into external AI tools.', severity: 'mandatory' },
      { number: '6.13', text: 'The AI usage threshold may be adjusted by the platform based on evolving educational standards. Delegates will be notified of changes.', severity: 'important' },
      { number: '6.14', text: 'Teachers may set stricter AI usage limits for their students than the platform default. Such limits take precedence for that class\'s submissions.', severity: 'important' },
      { number: '6.15', text: 'The DiplomatiQ platform encourages responsible AI literacy as an essential 21st-century skill. The goal is to teach delegates how to use AI ethically, not to prohibit its use entirely.', severity: 'recommended' },
    ],
  },

  // ══════════════════════════════════════════════
  // 7. PARLIAMENTARY PROCEDURE COMPLIANCE
  // ══════════════════════════════════════════════
  {
    id: 'parliamentary-procedure',
    title: 'Parliamentary Procedure Compliance',
    icon: 'BookOpen',
    description: 'Rules governing adherence to formal parliamentary procedure in all committee sessions.',
    rules: [
      { number: '7.1', text: 'All committee sessions shall be conducted according to the parliamentary procedure designated by the conference rules, typically based on Robert\'s Rules of Order as adapted for MUN.', severity: 'mandatory' },
      { number: '7.2', text: 'Delegates shall raise their placard to be recognized by the Chair before speaking. Speaking without recognition is out of order.', severity: 'mandatory' },
      { number: '7.3', text: 'Motions must be seconded before being considered by the committee, unless the rules specify otherwise.', severity: 'mandatory' },
      { number: '7.4', text: 'Delegates shall use the proper terminology for motions, including "motion for a moderated caucus," "motion to set the agenda," and "motion for a roll call vote."', severity: 'important' },
      { number: '7.5', text: 'The Chair\'s ruling on procedural matters is final unless appealed according to the established appeals process.', severity: 'mandatory' },
      { number: '7.6', text: 'Points of Order take precedence over the current speaker and must be addressed immediately by the Chair.', severity: 'mandatory' },
      { number: '7.7', text: 'Delegates shall not use procedural motions as a dilatory tactic to obstruct committee progress. The Chair may rule such motions out of order.', severity: 'mandatory' },
      { number: '7.8', text: 'Voting on procedural matters requires a simple majority unless the conference rules specify otherwise.', severity: 'important' },
      { number: '7.9', text: 'Voting on substantive matters, including resolutions and amendments, shall follow the procedure designated by the committee type and conference rules.', severity: 'mandatory' },
      { number: '7.10', text: 'Delegates shall not reveal their vote during a secret ballot, nor shall they attempt to discover how others voted.', severity: 'mandatory' },
      { number: '7.11', text: 'The yield mechanism (yielding to another delegate, to questions, or to the Chair) shall be used properly and not as a means to extend speaking time beyond limits.', severity: 'important' },
      { number: '7.12', text: 'Delegates shall not speak on both sides of a substantive vote during the same speakers list cycle.', severity: 'important' },
      { number: '7.13', text: 'Division of the question must be requested before voting begins on a resolution, not after votes have been cast.', severity: 'mandatory' },
      { number: '7.14', text: 'The right of reply shall be exercised judiciously and only when a delegate feels personally insulted, not merely when they disagree with another delegate\'s argument.', severity: 'important' },
      { number: '7.15', text: 'Delegates shall not challenge the Chair\'s authority through disruptive means. Disagreements with rulings shall be addressed through proper appeals processes.', severity: 'mandatory' },
      { number: '7.16', text: 'Motions to suspend the meeting or adjourn shall follow the priority order established by the rules of procedure.', severity: 'recommended' },
      { number: '7.17', text: 'When the Chair rules a motion out of order, the delegate who raised the motion shall accept the ruling gracefully and not pursue further disruptive challenges.', severity: 'important' },
      { number: '7.18', text: 'Delegates shall familiarize themselves with the specific rules of procedure adopted by each conference, as variations may exist between conferences.', severity: 'recommended' },
    ],
  },

  // ══════════════════════════════════════════════
  // 8. DEBATE CONDUCT
  // ══════════════════════════════════════════════
  {
    id: 'debate-conduct',
    title: 'Debate Conduct',
    icon: 'MessageSquare',
    description: 'Standards for participation in formal and informal debate within committee sessions.',
    rules: [
      { number: '8.1', text: 'Delegates shall prepare thoroughly for committee sessions by researching their assigned country, agenda topics, international agreements, and relevant geopolitical developments.', severity: 'mandatory' },
      { number: '8.2', text: 'All speeches, interventions, and statements shall remain relevant to the agenda and contribute constructively to debate.', severity: 'mandatory' },
      { number: '8.3', text: 'Delegates shall not interrupt speakers except through approved parliamentary motions and points.', severity: 'mandatory' },
      { number: '8.4', text: 'Personal attacks, insults, intimidation, discriminatory remarks, or disrespectful behavior during debate shall result in disciplinary action.', severity: 'mandatory' },
      { number: '8.5', text: 'Delegates shall respect speaking time limits and yield the floor promptly when their time has elapsed.', severity: 'mandatory' },
      { number: '8.6', text: 'Delegates shall not engage in side conversations or whispering during formal debate that disrupts the proceedings or excludes other participants.', severity: 'important' },
      { number: '8.7', text: 'During unmoderated caucuses, delegates shall engage in substantive negotiation and coalition-building, not socializing to the exclusion of committee work.', severity: 'important' },
      { number: '8.8', text: 'Delegates shall pursue consensus-building and collaborative problem-solving whenever possible, prioritizing collective progress over individual recognition.', severity: 'recommended' },
      { number: '8.9', text: 'Delegates shall not deliberately mislead other delegates about their country\'s position or intentions in order to gain tactical advantage.', severity: 'mandatory' },
      { number: '8.10', text: 'When receiving awards or recognition, delegates shall display humility and grace, acknowledging the contributions of their fellow delegates.', severity: 'recommended' },
      { number: '8.11', text: 'Delegates shall not fabricate or misrepresent their country\'s foreign policy positions, voting record, or international commitments.', severity: 'mandatory' },
      { number: '8.12', text: 'Repeated violations of debate conduct may result in the Chair revoking a delegate\'s speaking privileges for the remainder of the session.', severity: 'important' },
      { number: '8.13', text: 'Delegates shall not claim to represent or speak on behalf of countries, organizations, or entities they have not been officially assigned.', severity: 'mandatory' },
      { number: '8.14', text: 'Use of personal electronic devices during formal debate is prohibited except for approved research purposes as determined by the Chair.', severity: 'important' },
      { number: '8.15', text: 'Delegates shall remain in the committee room during formal sessions unless excused by the Chair. Extended absences demonstrate disrespect for the proceedings.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 9. SPEECH & ORATORY STANDARDS
  // ══════════════════════════════════════════════
  {
    id: 'speech-oratory',
    title: 'Speech & Oratory Standards',
    icon: 'Mic',
    description: 'Standards for public speaking, oratory delivery, and speech construction in MUN contexts.',
    rules: [
      { number: '9.1', text: 'Delegates shall use proper parliamentary language and diplomatic etiquette when addressing chairs and fellow delegates, including formal salutations such as "Honorable Chair" and "Fellow Delegates."', severity: 'mandatory' },
      { number: '9.2', text: 'Speeches should be structured with a clear introduction, body, and conclusion, presenting arguments in a logical and persuasive manner.', severity: 'important' },
      { number: '9.3', text: 'Delegates shall avoid reading speeches verbatim from prepared text. Effective oratory involves extemporaneous delivery with reference to notes.', severity: 'recommended' },
      { number: '9.4', text: 'Rhetorical devices (metaphor, analogy, repetition, tricolon) are encouraged to enhance the persuasiveness of speeches, provided they do not mislead or misrepresent facts.', severity: 'recommended' },
      { number: '9.5', text: 'Delegates shall maintain appropriate eye contact, vocal projection, and physical composure when delivering speeches.', severity: 'recommended' },
      { number: '9.6', text: 'Speeches shall not contain profanity, vulgarity, hate speech, or language that is demeaning to any individual, group, or nation.', severity: 'mandatory' },
      { number: '9.7', text: 'When yielding to questions, delegates shall respond directly and honestly, avoiding evasion while maintaining their country\'s diplomatic position.', severity: 'important' },
      { number: '9.8', text: 'Delegates shall not use speaking time to personally attack or humiliate another delegate, regardless of the strength of their disagreement.', severity: 'mandatory' },
      { number: '9.9', text: 'Quotes from real-world leaders, UN officials, or historical figures must be accurately attributed and not fabricated.', severity: 'mandatory' },
      { number: '9.10', text: 'Humor may be used appropriately to engage the committee, provided it is respectful, relevant, and does not target individuals or groups.', severity: 'recommended' },
      { number: '9.11', text: 'Delegates speaking in a non-native language shall be given the same respect and consideration as native speakers. Mockery of language difficulties is strictly prohibited.', severity: 'mandatory' },
      { number: '9.12', text: 'Right of reply speeches shall be concise, measured, and focused on addressing the perceived insult rather than escalating conflict.', severity: 'important' },
      { number: '9.13', text: 'Delegates shall practice their speeches to ensure they can deliver them within the allotted time limit without rushing or significantly underusing time.', severity: 'recommended' },
    ],
  },

  // ══════════════════════════════════════════════
  // 10. RESOLUTION WRITING STANDARDS
  // ══════════════════════════════════════════════
  {
    id: 'resolution-writing',
    title: 'Resolution Writing Standards',
    icon: 'FileText',
    description: 'Standards for drafting, formatting, and submitting resolutions in committee.',
    rules: [
      { number: '10.1', text: 'Resolutions shall follow the standard MUN format: a heading, perambulatory clauses, and operative clauses, as specified by the conference rules.', severity: 'mandatory' },
      { number: '10.2', text: 'Preambulatory clauses shall accurately reference relevant UN documents, treaties, prior resolutions, and international agreements using correct document numbers and dates.', severity: 'mandatory' },
      { number: '10.3', text: 'Operative clauses shall propose specific, actionable measures rather than vague aspirations. Each clause should clearly state what action is recommended and by whom.', severity: 'important' },
      { number: '10.4', text: 'Resolutions shall be the collaborative work of the sponsors and shall not be written by a single delegate without meaningful input from co-sponsors.', severity: 'important' },
      { number: '10.5', text: 'Delegates shall not submit resolutions or working papers that have been substantially copied from real United Nations documents without proper attribution and original operative contributions.', severity: 'mandatory' },
      { number: '10.6', text: 'All resolutions must include proper formatting: numbered operative clauses, italicized perambulatory phrases, and consistent indentation.', severity: 'important' },
      { number: '10.7', text: 'Sponsors shall be prepared to explain and defend every clause of their resolution during debate. Clauses that cannot be defended should be reconsidered before submission.', severity: 'important' },
      { number: '10.8', text: 'Signatories do not necessarily endorse a resolution but indicate willingness to have it brought before the committee. This distinction shall be respected.', severity: 'recommended' },
      { number: '10.9', text: 'Working papers must be submitted to the Chair in the prescribed format and within the designated timeline to be considered for formal debate.', severity: 'mandatory' },
      { number: '10.10', text: 'Delegates shall not submit frivolous or satirical resolutions that undermine the seriousness of the committee\'s work.', severity: 'mandatory' },
      { number: '10.11', text: 'The use of AI to generate any portion of a resolution must be disclosed in accordance with the AI Content Usage Policy (Section 6).', severity: 'mandatory' },
      { number: '10.12', text: 'Resolution titles shall be descriptive and professional, accurately reflecting the content and intent of the document.', severity: 'recommended' },
      { number: '10.13', text: 'Delegates shall not intentionally embed contradictory clauses in resolutions to create procedural confusion during voting.', severity: 'mandatory' },
    ],
  },

  // ══════════════════════════════════════════════
  // 11. AMENDMENT PROCEDURES
  // ══════════════════════════════════════════════
  {
    id: 'amendment-procedures',
    title: 'Amendment Procedures',
    icon: 'PenLine',
    description: 'Rules for proposing, debating, and voting on amendments to draft resolutions.',
    rules: [
      { number: '11.1', text: 'Amendments shall be submitted in writing to the Chair using the prescribed format, clearly identifying the clause being amended and the proposed change.', severity: 'mandatory' },
      { number: '11.2', text: 'Friendly amendments — those accepted by all sponsors of the resolution — may be incorporated without a vote, subject to the Chair\'s approval.', severity: 'important' },
      { number: '11.3', text: 'Unfriendly amendments — those not accepted by all sponsors — must be seconded and will be subject to debate and vote.', severity: 'mandatory' },
      { number: '11.4', text: 'Delegates shall not propose amendments that fundamentally alter the purpose or intent of a resolution beyond recognition; such changes warrant a separate resolution.', severity: 'important' },
      { number: '11.5', text: 'Amendments shall be debated in the order determined by the Chair, typically from most to least substantive.', severity: 'important' },
      { number: '11.6', text: 'Delegates proposing amendments shall be prepared to explain the rationale for the change and its anticipated impact on the resolution.', severity: 'important' },
      { number: '11.7', text: 'Amendments to amendments (sub-amendments) may be permitted at the Chair\'s discretion but should be avoided when they complicate proceedings unnecessarily.', severity: 'recommended' },
      { number: '11.8', text: 'Delegates shall not propose amendments for the sole purpose of delaying or obstructing the voting process.', severity: 'mandatory' },
      { number: '11.9', text: 'Withdrawn amendments shall not be reintroduced during the same voting procedure without the Chair\'s permission.', severity: 'important' },
      { number: '11.10', text: 'The Chair shall clearly announce the result of each amendment vote and its effect on the resolution before proceeding to the next amendment.', severity: 'mandatory' },
      { number: '11.11', text: 'Typographical or grammatical corrections that do not change the meaning of a clause may be made by the Chair without a formal amendment process.', severity: 'recommended' },
      { number: '11.12', text: 'Delegates shall not propose amendments to clauses that have already been voted upon and adopted, unless a motion to reconsider is properly passed.', severity: 'mandatory' },
    ],
  },

  // ══════════════════════════════════════════════
  // 12. VOTING PROTOCOL
  // ══════════════════════════════════════════════
  {
    id: 'voting-protocol',
    title: 'Voting Protocol',
    icon: 'Vote',
    description: 'Formal rules governing all voting procedures, from procedural motions to substantive resolutions.',
    rules: [
      { number: '12.1', text: 'All delegates present in the committee room during a vote shall cast their vote. Abstentions are permitted on substantive matters but not on procedural votes.', severity: 'mandatory' },
      { number: '12.2', text: 'Voting shall be conducted by placard raise unless a motion for a roll call vote is properly seconded and approved.', severity: 'mandatory' },
      { number: '12.3', text: 'During roll call votes, delegates shall respond with "Yes," "No," "Abstain," or "Pass." A delegate who passes will be called again at the end of the roll.', severity: 'mandatory' },
      { number: '12.4', text: 'Delegates shall not reveal how they voted during a secret ballot, nor attempt to discover or influence another delegate\'s secret ballot vote.', severity: 'mandatory' },
      { number: '12.5', text: 'Delegates shall not engage in lobbying or persuasion during the actual voting process. All discussion must occur before voting commences.', severity: 'mandatory' },
      { number: '12.6', text: 'The Chair shall announce the result of each vote clearly, stating the count of votes in favor, against, and abstentions.', severity: 'mandatory' },
      { number: '12.7', text: 'A simple majority is required for procedural matters. Substantive matters may require a two-thirds majority depending on the committee type and rules.', severity: 'important' },
      { number: '12.8', text: 'Delegates shall not attempt to vote on behalf of absent delegates or use another delegate\'s placard.', severity: 'mandatory' },
      { number: '12.9', text: 'In Security Council simulations, the veto power of permanent members shall be respected and applied according to the committee rules.', severity: 'mandatory' },
      { number: '12.10', text: 'Motions for division of the question must be raised before voting on the resolution begins. Once voting has commenced, the question cannot be divided.', severity: 'mandatory' },
      { number: '12.11', text: 'Delegates may request a recount immediately after a close vote result is announced. The Chair shall honor reasonable recount requests.', severity: 'recommended' },
      { number: '12.12', text: 'Voting results are final once confirmed by the Chair, except where a valid motion to reconsider is properly passed.', severity: 'important' },
      { number: '12.13', text: 'Delegates shall accept voting outcomes gracefully, regardless of whether the result aligns with their position. Disputing legitimate results is unprofessional.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 13. CAUCUS BEHAVIOR
  // ══════════════════════════════════════════════
  {
    id: 'caucus-behavior',
    title: 'Caucus Behavior',
    icon: 'Users',
    description: 'Standards for conduct during moderated and unmoderated caucuses.',
    rules: [
      { number: '13.1', text: 'During moderated caucuses, delegates shall raise their placards and wait to be recognized by the Chair before speaking.', severity: 'mandatory' },
      { number: '13.2', text: 'Delegates shall keep their moderated caucus speeches focused on the specific sub-topic proposed in the caucus motion.', severity: 'important' },
      { number: '13.3', text: 'During unmoderated caucuses, delegates shall use the time for substantive negotiation, coalition-building, and resolution drafting.', severity: 'important' },
      { number: '13.4', text: 'Delegates shall not use unmoderated caucus time to exclude others from discussions. All interested delegates should be allowed to participate in working groups.', severity: 'mandatory' },
      { number: '13.5', text: 'Private agreements made during unmoderated caucuses should be honored. Deliberate deception about one\'s voting intentions during caucus is unethical.', severity: 'important' },
      { number: '13.6', text: 'Delegates shall not leave the committee room during caucus without the Chair\'s permission, as their presence may be needed for quorum.', severity: 'important' },
      { number: '13.7', text: 'Working groups formed during unmoderated caucuses shall welcome new members who wish to contribute, regardless of their country\'s typical bloc alignment.', severity: 'recommended' },
      { number: '13.8', text: 'Delegates shall not monopolize the discussion during moderated caucuses. Repeated speaking should be balanced with yielding to new speakers.', severity: 'important' },
      { number: '13.9', text: 'The Chair may end a caucus early if it becomes unproductive or if delegates are not engaging in substantive work.', severity: 'important' },
      { number: '13.10', text: 'Delegates shall return to their seats promptly when the Chair calls the committee back to order following a caucus.', severity: 'mandatory' },
      { number: '13.11', text: 'Food and beverages consumed during unmoderated caucuses must be handled responsibly. Delegates shall clean up after themselves.', severity: 'recommended' },
      { number: '13.12', text: 'Delegates shall not use caucus time to form alliances based solely on personal relationships or shared nationality rather than diplomatic alignment.', severity: 'recommended' },
    ],
  },

  // ══════════════════════════════════════════════
  // 14. COMMITTEE SESSION CONDUCT
  // ══════════════════════════════════════════════
  {
    id: 'committee-session',
    title: 'Committee Session Conduct',
    icon: 'Building2',
    description: 'Rules governing attendance, participation, and conduct throughout formal committee sessions.',
    rules: [
      { number: '14.1', text: 'Delegates shall arrive on time for all scheduled committee sessions. Late arrivals disrupt proceedings and demonstrate disrespect for the committee.', severity: 'mandatory' },
      { number: '14.2', text: 'Attendance shall be taken at the beginning of each session. Delegates not present for roll call may be marked absent.', severity: 'important' },
      { number: '14.3', text: 'Delegates shall remain seated at their assigned positions during formal debate unless rising to deliver a speech or raise a point.', severity: 'important' },
      { number: '14.4', text: 'Country placards shall be displayed prominently at all times during session and shall not be used for purposes other than identification and voting.', severity: 'mandatory' },
      { number: '14.5', text: 'Delegates shall not leave the committee room during formal session without the Chair\'s permission. Extended absences may be reflected in participation scores.', severity: 'important' },
      { number: '14.6', text: 'The use of mobile phones, tablets, or laptops during formal session is prohibited except for approved research purposes as determined by the Chair.', severity: 'important' },
      { number: '14.7', text: 'Note passing between delegates during formal session shall be conducted discreetly and shall not disrupt proceedings. The Chair may restrict or prohibit note passing.', severity: 'recommended' },
      { number: '14.8', text: 'Delegates shall maintain professional posture and demeanor during sessions. Sleeping, resting heads on desks, or displaying inattentiveness is unprofessional.', severity: 'important' },
      { number: '14.9', text: 'All delegates shall actively participate in committee proceedings. Persistent non-participation without valid reason may result in intervention by the Chair.', severity: 'important' },
      { number: '14.10', text: 'Delegates shall respect the physical space of the committee room, including proper placement of placards, materials, and personal belongings.', severity: 'important' },
      { number: '14.11', text: 'Recording or photographing committee proceedings without authorization is prohibited.', severity: 'mandatory' },
      { number: '14.12', text: 'Delegates who feel unwell, distressed, or unsafe during any session shall inform the Chair or a designated safeguarding officer immediately.', severity: 'mandatory' },
    ],
  },

  // ══════════════════════════════════════════════
  // 15. CRISIS COMMITTEE PROTOCOLS
  // ══════════════════════════════════════════════
  {
    id: 'crisis-committee',
    title: 'Crisis Committee Protocols',
    icon: 'AlertTriangle',
    description: 'Special rules for crisis committee simulations, directives, and back-channel communications.',
    rules: [
      { number: '15.1', text: 'Crisis committee delegates shall remain in character at all times, responding to crisis updates as their assigned role would in a real-world scenario.', severity: 'mandatory' },
      { number: '15.2', text: 'Crisis notes and directives must be realistic, within the authority of the delegate\'s assigned role, and consistent with established crisis parameters.', severity: 'mandatory' },
      { number: '15.3', text: 'Delegates shall not act on information they have learned out-of-character that their assigned role would not realistically know.', severity: 'mandatory' },
      { number: '15.4', text: 'Crisis updates delivered by the crisis staff shall be accepted as factual within the simulation and shall not be challenged on the basis of real-world accuracy.', severity: 'important' },
      { number: '15.5', text: 'Delegates shall not write directives that are frivolous, impossible, or clearly intended to disrupt the simulation rather than advance the crisis narrative.', severity: 'mandatory' },
      { number: '15.6', text: 'Back-channel communications through crisis notes must follow the established format and be submitted through official channels only.', severity: 'mandatory' },
      { number: '15.7', text: 'Delegates shall not share the contents of their personal crisis updates with other delegates unless they choose to do so in-character.', severity: 'important' },
      { number: '15.8', text: 'The crisis staff retains the right to modify or reject directives that are unrealistic, contradictory to established crisis parameters, or disruptive to the simulation.', severity: 'mandatory' },
      { number: '15.9', text: 'Crisis scenarios involving graphic violence, sexual content, or culturally sensitive topics must be handled with the utmost maturity and respect.', severity: 'mandatory' },
      { number: '15.10', text: 'Delegates who are uncomfortable with the direction of a crisis simulation should speak privately with the Chair or a safeguarding officer.', severity: 'important' },
      { number: '15.11', text: 'Joint crisis committees must coordinate through proper crisis staff channels. Direct communication between committees is prohibited unless facilitated by crisis staff.', severity: 'important' },
      { number: '15.12', text: 'Crisis simulations shall not be used as a venue for personal grievances or real-world political advocacy that disrupts the educational purpose.', severity: 'mandatory' },
      { number: '15.13', text: 'Delegates shall not attempt to "break" the crisis scenario by exploiting logical inconsistencies or meta-gaming the crisis structure.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 16. SECURITY COUNCIL PROCEDURES
  // ══════════════════════════════════════════════
  {
    id: 'security-council',
    title: 'Security Council Procedures',
    icon: 'ShieldAlert',
    description: 'Specific rules governing the United Nations Security Council simulation and veto procedures.',
    rules: [
      { number: '16.1', text: 'Security Council delegates shall understand and respect the unique procedural rules of the Security Council, which differ from General Assembly committees.', severity: 'mandatory' },
      { number: '16.2', text: 'The five permanent members (P5) — China, France, Russia, the United Kingdom, and the United States — possess veto power on substantive matters. This power shall be exercised judiciously and realistically.', severity: 'mandatory' },
      { number: '16.3', text: 'The veto shall not be used as a personal tool to obstruct all committee progress. Delegates wielding the veto should be prepared to justify their decision diplomatically.', severity: 'important' },
      { number: '16.4', text: 'Non-permanent members of the Security Council have equal speaking rights and shall not be marginalized or excluded from substantive discussions.', severity: 'mandatory' },
      { number: '16.5', text: 'The President of the Security Council role shall rotate according to the established order, and the presiding delegate shall exercise this authority impartially.', severity: 'important' },
      { number: '16.6', text: 'Security Council resolutions require nine affirmative votes, including the concurring votes of all permanent members on substantive matters, unless a permanent member abstains.', severity: 'mandatory' },
      { number: '16.7', text: 'Delegates shall not misuse procedural knowledge of Security Council rules to create deadlock or prevent meaningful action.', severity: 'important' },
      { number: '16.8', text: 'Emergency special sessions may be called in accordance with the "Uniting for Peace" resolution when the Security Council is deadlocked.', severity: 'recommended' },
      { number: '16.9', text: 'Delegates representing P5 nations shall understand the historical and contemporary context of their country\'s veto usage to represent it accurately.', severity: 'important' },
      { number: '16.10', text: 'The Security Council shall not consider matters that are primarily within the domestic jurisdiction of any state, unless the situation constitutes a threat to international peace and security.', severity: 'important' },
      { number: '16.11', text: 'Security Council delegates shall familiarize themselves with Chapter VI (Pacific Settlement of Disputes) and Chapter VII (Action with Respect to Threats to the Peace) of the UN Charter.', severity: 'recommended' },
      { number: '16.12', text: 'Informal consultations ("Arria-formula meetings") may be held at the discretion of the Council president and shall follow the same standards of diplomatic conduct.', severity: 'recommended' },
    ],
  },

  // ══════════════════════════════════════════════
  // 17. INTERNATIONAL COURT OF JUSTICE RULES
  // ══════════════════════════════════════════════
  {
    id: 'icj-rules',
    title: 'International Court of Justice Rules',
    icon: 'Gavel',
    description: 'Specialized rules for ICJ simulations, including advocacy, deliberation, and advisory opinions.',
    rules: [
      { number: '17.1', text: 'ICJ simulations shall follow procedures modeled on the Statute of the International Court of Justice and the Court\'s Rules of Procedure.', severity: 'mandatory' },
      { number: '17.2', text: 'Advocates shall present their case with legal rigor, citing relevant international law, treaties, customary law, and judicial precedent.', severity: 'mandatory' },
      { number: '17.3', text: 'Judges shall remain impartial throughout the proceedings, evaluating arguments solely on their legal merit and not on personal sympathies or political considerations.', severity: 'mandatory' },
      { number: '17.4', text: 'Advocates shall not fabricate legal precedents, treaty provisions, or evidence. All cited authorities must be genuine and verifiable.', severity: 'mandatory' },
      { number: '17.5', text: 'Judges may ask questions of advocates during oral proceedings but shall not demonstrate bias through the nature or frequency of their questions.', severity: 'important' },
      { number: '17.6', text: 'Deliberations among judges shall be conducted with respect for differing legal interpretations. Dissenting opinions are valued and encouraged.', severity: 'important' },
      { number: '17.7', text: 'The judgment shall be based on applicable international law, not on what the judges believe would be the most politically expedient outcome.', severity: 'mandatory' },
      { number: '17.8', text: 'Dissenting and separate opinions shall be written individually by the judges who hold them and shall not be coerced or discouraged.', severity: 'important' },
      { number: '17.9', text: 'Advocates shall address the Court with proper formal language and demeanor, referring to judges as "Your Excellency" or "Judge."', severity: 'important' },
      { number: '17.10', text: 'Advisory opinions requested by authorized bodies shall follow the same standards of legal analysis and judicial independence as contentious cases.', severity: 'recommended' },
      { number: '17.11', text: 'Memorial and counter-memorial submissions must comply with the formatting and length requirements specified by the Court president.', severity: 'important' },
      { number: '17.12', text: 'Rehearsals or pre-written judgments that circumvent genuine legal deliberation are prohibited and undermine the educational purpose of the ICJ simulation.', severity: 'mandatory' },
    ],
  },

  // ══════════════════════════════════════════════
  // 18. PRESS CORPS & MEDIA GUIDELINES
  // ══════════════════════════════════════════════
  {
    id: 'press-corps',
    title: 'Press Corps & Media Guidelines',
    icon: 'Newspaper',
    description: 'Standards for press corps delegates and media coverage within MUN conferences.',
    rules: [
      { number: '18.1', text: 'Press Corps delegates shall report on committee proceedings accurately and fairly, maintaining journalistic integrity at all times.', severity: 'mandatory' },
      { number: '18.2', text: 'Articles and press releases shall not contain fabricated quotes, misrepresented statements, or misleading characterizations of delegates\' positions.', severity: 'mandatory' },
      { number: '18.3', text: 'Press delegates shall not use their platform to advance a personal agenda, favor specific delegates, or unfairly target individuals.', severity: 'mandatory' },
      { number: '18.4', text: 'Interviews with delegates must be conducted with their consent. Delegates have the right to decline interviews without penalty.', severity: 'important' },
      { number: '18.5', text: 'Press publications shall respect off-the-record and embargoed information. Violating these journalistic norms is a serious breach.', severity: 'mandatory' },
      { number: '18.6', text: 'Satirical or opinion pieces shall be clearly labeled as such and shall not be presented as objective reporting.', severity: 'important' },
      { number: '18.7', text: 'Press Corps delegates shall not disrupt committee proceedings to obtain stories or conduct interviews during formal debate.', severity: 'mandatory' },
      { number: '18.8', text: 'Photography and video recording in committee sessions require authorization from the Chair and the delegates being recorded.', severity: 'important' },
      { number: '18.9', text: 'Press coverage shall be balanced across committees, avoiding disproportionate attention to some committees at the expense of others.', severity: 'recommended' },
      { number: '18.10', text: 'The editorial board of the Press Corps shall establish publication standards and review content before distribution.', severity: 'important' },
      { number: '18.11', text: 'Press delegates shall not publish content that could compromise the safety, privacy, or dignity of any participant.', severity: 'mandatory' },
      { number: '18.12', text: 'Press credentials may be revoked for violations of journalistic ethics, following a review by the Press Corps director and conference Secretariat.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 19. DELEGATE PREPARATION
  // ══════════════════════════════════════════════
  {
    id: 'delegate-preparation',
    title: 'Delegate Preparation',
    icon: 'BookMarked',
    description: 'Expectations for pre-conference preparation, research, and readiness for committee participation.',
    rules: [
      { number: '19.1', text: 'Delegates shall research their assigned country\'s history, government structure, foreign policy priorities, and key international relationships prior to the conference.', severity: 'mandatory' },
      { number: '19.2', text: 'Delegates shall study all agenda topics in depth, understanding the historical context, current developments, and their country\'s stated position on each issue.', severity: 'mandatory' },
      { number: '19.3', text: 'Position papers shall be completed and submitted by the specified deadline. Late submissions may result in reduced consideration for awards.', severity: 'important' },
      { number: '19.4', text: 'Delegates shall familiarize themselves with the rules of procedure before the conference begins, reducing procedural confusion during sessions.', severity: 'important' },
      { number: '19.5', text: 'The DiplomatiQ Academy training courses are strongly recommended for delegates of all experience levels to develop and refine their skills.', severity: 'recommended' },
      { number: '19.6', text: 'Delegates shall prepare potential alliance strategies and identify likely allies and opponents on each agenda topic.', severity: 'recommended' },
      { number: '19.7', text: 'Delegates shall bring printed copies of key documents, resolutions, and research materials to the conference for reference during sessions.', severity: 'recommended' },
      { number: '19.8', text: 'Delegates shall not rely solely on internet access during conferences for research, as connectivity may be limited.', severity: 'important' },
      { number: '19.9', text: 'Preparation shall include practice with public speaking, resolution writing, and parliamentary procedure to ensure effective participation.', severity: 'recommended' },
      { number: '19.10', text: 'Delegates shall review the background guide provided by their committee and come prepared with questions and discussion points.', severity: 'important' },
      { number: '19.11', text: 'Teachers and advisors shall verify that their delegates have completed adequate preparation before the conference, providing support where needed.', severity: 'important' },
      { number: '19.12', text: 'First-time delegates are encouraged to attend orientation sessions and seek guidance from experienced delegates or advisors.', severity: 'recommended' },
    ],
  },

  // ══════════════════════════════════════════════
  // 20. RESEARCH & POSITION PAPERS
  // ══════════════════════════════════════════════
  {
    id: 'research-position-papers',
    title: 'Research & Position Papers',
    icon: 'Search',
    description: 'Standards for research methodology, source evaluation, and position paper writing.',
    rules: [
      { number: '20.1', text: 'Delegates shall use reputable, verifiable sources for all research, prioritizing primary sources such as UN documents, treaties, and official government publications.', severity: 'mandatory' },
      { number: '20.2', text: 'The CRAAP test (Currency, Relevance, Authority, Accuracy, Purpose) shall be applied to evaluate all sources before inclusion in position papers or resolutions.', severity: 'important' },
      { number: '20.3', text: 'Wikipedia and similar crowd-sourced encyclopedias may be used as starting points for orientation but shall not be cited as authoritative sources in formal documents.', severity: 'important' },
      { number: '20.4', text: 'Delegates shall cross-reference important claims with at least two independent, credible sources before presenting them as factual in committee.', severity: 'important' },
      { number: '20.5', text: 'Statistical data shall be drawn from recognized international organizations (UN agencies, World Bank, WHO, etc.) and properly cited with date of access.', severity: 'mandatory' },
      { number: '20.6', text: 'Delegates shall not cherry-pick data to support a predetermined position while ignoring contradictory evidence from equally credible sources.', severity: 'important' },
      { number: '20.7', text: 'Position papers shall accurately reflect the assigned country\'s foreign policy, not the delegate\'s personal opinions.', severity: 'mandatory' },
      { number: '20.8', text: 'Position papers shall follow the prescribed format: introduction of the topic, history of the issue, the country\'s policy, and proposed solutions.', severity: 'important' },
      { number: '20.9', text: 'All position papers shall include proper citations using a recognized format (MLA, APA, or Chicago) as specified by the conference.', severity: 'mandatory' },
      { number: '20.10', text: 'Delegates shall not cite sources they have not actually read or reviewed. Listing references without genuine engagement constitutes academic dishonesty.', severity: 'mandatory' },
      { number: '20.11', text: 'Historical sources shall be contextualized appropriately, recognizing that historical perspectives and terminology may differ from contemporary standards.', severity: 'recommended' },
      { number: '20.12', text: 'Research conducted using the DiplomatiQ Research Lab shall adhere to the same academic integrity standards as any other research method.', severity: 'mandatory' },
      { number: '20.13', text: 'Delegates shall distinguish between fact, opinion, and speculation in their research and presentations, clearly indicating the nature of each claim.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 21. COUNTRY REPRESENTATION
  // ══════════════════════════════════════════════
  {
    id: 'country-representation',
    title: 'Country Representation',
    icon: 'Globe',
    description: 'Standards for accurately and respectfully representing assigned nations in committee.',
    rules: [
      { number: '21.1', text: 'Delegates shall represent their assigned country\'s foreign policy positions accurately, even when those positions differ from their personal beliefs.', severity: 'mandatory' },
      { number: '21.2', text: 'Delegates shall research their country\'s voting record at the United Nations, its treaty obligations, and its public statements on relevant issues.', severity: 'mandatory' },
      { number: '21.3', text: 'Caricaturing, mocking, or stereotyping a country or its people through one\'s representation is strictly prohibited and constitutes disrespectful conduct.', severity: 'mandatory' },
      { number: '21.4', text: 'Delegates shall not adopt positions that are fundamentally inconsistent with their country\'s established foreign policy without credible justification.', severity: 'important' },
      { number: '21.5', text: 'When a country\'s position on a specific issue is unclear or undocumented, delegates may make reasonable inferences based on the country\'s general foreign policy orientation.', severity: 'recommended' },
      { number: '21.6', text: 'Delegates representing observer states or non-state actors shall understand the unique limitations and privileges of their entity\'s status.', severity: 'important' },
      { number: '21.7', text: 'National dress, cultural practices, and diplomatic customs of the represented country may be incorporated respectfully but shall not be performed as caricature.', severity: 'important' },
      { number: '21.8', text: 'Delegates shall not use their country assignment to make offensive statements about rival nations or advance real-world political animosities.', severity: 'mandatory' },
      { number: '21.9', text: 'The representation of countries with controversial or objectionable policies shall be handled with maturity. Delegates are simulating, not endorsing.', severity: 'important' },
      { number: '21.10', text: 'Delegates shall not refuse to represent their assigned country on political or moral grounds. If such concerns exist, they should be raised with the advisor before the conference.', severity: 'important' },
      { number: '21.11', text: 'Country assignments are made by the Secretariat and are final. Delegates shall not trade assignments without official authorization.', severity: 'mandatory' },
      { number: '21.12', text: 'Delegates shall understand their country\'s regional group memberships and typical voting bloc alignments at the United Nations.', severity: 'recommended' },
    ],
  },

  // ══════════════════════════════════════════════
  // 22. ALLIANCE & BLOC FORMATION
  // ══════════════════════════════════════════════
  {
    id: 'alliance-bloc',
    title: 'Alliance & Bloc Formation',
    icon: 'Handshake',
    description: 'Rules governing the formation of alliances, voting blocs, and diplomatic coalitions.',
    rules: [
      { number: '22.1', text: 'Alliances and blocs shall be formed on the basis of shared diplomatic interests and policy alignment, not personal friendships or shared nationality.', severity: 'important' },
      { number: '22.2', text: 'Delegates shall not exclude others from joining a bloc or working group based on personal dislike, inexperience, or country assignment.', severity: 'mandatory' },
      { number: '22.3', text: 'Bloc agreements and shared positions should be negotiated in good faith. Delegates shall not enter alliances with the intention of betraying them later.', severity: 'important' },
      { number: '22.4', text: 'Recognized UN regional groups (African Group, G77, EU, ASEAN, Arab League, etc.) may serve as natural starting points for bloc formation, but cross-regional alliances are encouraged.', severity: 'recommended' },
      { number: '22.5', text: 'Delegates shall not use bloc voting to systematically exclude minority positions from substantive debate or resolution consideration.', severity: 'important' },
      { number: '22.6', text: 'Blocs shall not coerce individual delegates into voting against their country\'s position. Each delegate retains the right to vote according to their country\'s interest.', severity: 'mandatory' },
      { number: '22.7', text: 'Alliance commitments made during negotiation should be honored during voting. Deliberate violation of negotiated agreements undermines diplomatic trust.', severity: 'important' },
      { number: '22.8', text: 'Delegates may belong to multiple overlapping blocs and alliances, as real nations do, provided there is no conflict of commitment.', severity: 'recommended' },
      { number: '22.9', text: 'Bloc leaders shall not monopolize speaking opportunities or prevent other bloc members from expressing their views in committee.', severity: 'mandatory' },
      { number: '22.10', text: 'The formation of "super-blocs" designed to control all committee outcomes and exclude meaningful opposition is discouraged and counter to the collaborative spirit of MUN.', severity: 'recommended' },
      { number: '22.11', text: 'Delegates shall not threaten or intimidate others into joining or remaining in a bloc against their will.', severity: 'mandatory' },
    ],
  },

  // ══════════════════════════════════════════════
  // 23. NEGOTIATION ETHICS
  // ══════════════════════════════════════════════
  {
    id: 'negotiation-ethics',
    title: 'Negotiation Ethics',
    icon: 'HeartHandshake',
    description: 'Ethical standards for diplomatic negotiations, compromise, and deal-making in MUN.',
    rules: [
      { number: '23.1', text: 'Negotiations shall be conducted in good faith. Delegates shall not make commitments they have no intention of honoring.', severity: 'mandatory' },
      { number: '23.2', text: 'Delegates shall not misrepresent their country\'s position or flexibility during negotiations to extract concessions under false pretenses.', severity: 'mandatory' },
      { number: '23.3', text: 'Compromise is a fundamental diplomatic skill. Delegates shall approach negotiations with a genuine willingness to find common ground.', severity: 'recommended' },
      { number: '23.4', text: 'Confidential negotiation details shall not be disclosed to third parties without the consent of all parties involved in the negotiation.', severity: 'important' },
      { number: '23.5', text: 'Delegates shall not use threats, intimidation, or coercive tactics to force concessions from other delegates during negotiations.', severity: 'mandatory' },
      { number: '23.6', text: 'Quid pro quo arrangements in negotiations shall be based on legitimate diplomatic exchange, not personal favors or social leverage.', severity: 'important' },
      { number: '23.7', text: 'Delegates shall respect the principle of sovereign equality in negotiations. Smaller or less powerful nations deserve the same respectful treatment as major powers.', severity: 'mandatory' },
      { number: '23.8', text: 'Written agreements reached during negotiations shall be honored. Disavowing a signed agreement without justification is a serious breach of diplomatic trust.', severity: 'mandatory' },
      { number: '23.9', text: 'Delegates may walk away from negotiations if their country\'s core interests are threatened, but shall communicate their reasons diplomatically.', severity: 'recommended' },
      { number: '23.10', text: 'Third-party mediation of disputes shall be welcomed and respected. The mediator\'s role is to facilitate, not to impose outcomes.', severity: 'recommended' },
      { number: '23.11', text: 'Delegates shall not exploit another delegate\'s lack of experience or language difficulties to gain unfair advantage in negotiations.', severity: 'mandatory' },
      { number: '23.12', text: 'Negotiations conducted through the DiplomatiQ platform\'s chat or video features are subject to the same ethical standards as in-person negotiations.', severity: 'mandatory' },
    ],
  },

  // ══════════════════════════════════════════════
  // 24. CONFLICT RESOLUTION
  // ══════════════════════════════════════════════
  {
    id: 'conflict-resolution',
    title: 'Conflict Resolution',
    icon: 'Compass',
    description: 'Procedures for resolving interpersonal and procedural conflicts within MUN contexts.',
    rules: [
      { number: '24.1', text: 'Interpersonal conflicts between delegates shall be addressed privately and respectfully, not through public confrontation or disruption of committee proceedings.', severity: 'mandatory' },
      { number: '24.2', text: 'Delegates who are unable to resolve a conflict privately should seek mediation through the Chair, their advisor, or a designated conflict resolution officer.', severity: 'important' },
      { number: '24.3', text: 'Procedural disputes shall be resolved through the established appeals process, not through argument or refusal to comply with the Chair\'s ruling.', severity: 'mandatory' },
      { number: '24.4', text: 'The Chair shall serve as the primary mediator for procedural conflicts and shall do so impartially, without favoring any party.', severity: 'important' },
      { number: '24.5', text: 'Conflicts that cannot be resolved at the committee level shall be escalated to the Secretariat for mediation or adjudication.', severity: 'important' },
      { number: '24.6', text: 'Delegates shall not retaliate against others who have raised legitimate concerns or complaints through official channels.', severity: 'mandatory' },
      { number: '24.7', text: 'Mediation sessions shall be confidential, and parties shall not disclose the content of discussions without mutual consent.', severity: 'important' },
      { number: '24.8', text: 'Delegates shall approach conflict resolution with an open mind and willingness to compromise, rather than a determination to "win" the dispute.', severity: 'recommended' },
      { number: '24.9', text: 'Teachers and advisors shall support conflict resolution efforts but shall not intervene directly in committee proceedings or pressure the Chair to favor their students.', severity: 'important' },
      { number: '24.10', text: 'Persistent unresolved conflicts that disrupt the educational environment may result in the temporary removal of involved parties from the committee.', severity: 'important' },
      { number: '24.11', text: 'All parties in a conflict have the right to present their perspective and evidence before any judgment or disciplinary action is taken.', severity: 'mandatory' },
      { number: '24.12', text: 'The goal of conflict resolution is to restore a productive and respectful committee environment, not to assign blame or punishment unnecessarily.', severity: 'recommended' },
    ],
  },

  // ══════════════════════════════════════════════
  // 25. DIGITAL PLATFORM USAGE
  // ══════════════════════════════════════════════
  {
    id: 'digital-platform',
    title: 'Digital Platform Usage',
    icon: 'Monitor',
    description: 'Rules governing use of the DiplomatiQ digital platform, virtual sessions, and online tools.',
    rules: [
      { number: '25.1', text: 'All users shall comply with the DiplomatiQ Terms of Service and Acceptable Use Policy when accessing the platform.', severity: 'mandatory' },
      { number: '25.2', text: 'Users shall not attempt to hack, exploit, reverse-engineer, or compromise the platform\'s security, infrastructure, or data.', severity: 'mandatory' },
      { number: '25.3', text: 'Virtual committee sessions shall be treated with the same level of professionalism and engagement as in-person sessions.', severity: 'mandatory' },
      { number: '25.4', text: 'Users shall maintain a stable internet connection during virtual sessions. Persistent connectivity issues that disrupt the committee should be reported to the Chair.', severity: 'important' },
      { number: '25.5', text: 'Screen sharing, recording, or screenshotting virtual sessions without authorization is prohibited.', severity: 'mandatory' },
      { number: '25.6', text: 'Virtual backgrounds should be professional and non-distracting. Inappropriate or offensive virtual backgrounds are not permitted.', severity: 'important' },
      { number: '25.7', text: 'Users shall not use browser extensions, third-party tools, or scripts that interact with the platform in unauthorized ways.', severity: 'mandatory' },
      { number: '25.8', text: 'The DiplomatiQ Research Lab and assessment tools shall be used for their intended educational purposes only. Misuse for unauthorized content generation is prohibited.', severity: 'mandatory' },
      { number: '25.9', text: 'Users experiencing technical difficulties shall report them through the designated support channels rather than disrupting committee proceedings.', severity: 'important' },
      { number: '25.10', text: 'File uploads to the platform shall not contain malware, viruses, or malicious code. The platform reserves the right to scan all uploaded files.', severity: 'mandatory' },
      { number: '25.11', text: 'Users shall not create bots, automated scripts, or scraping tools to interact with the platform or extract data.', severity: 'mandatory' },
      { number: '25.12', text: 'Platform feedback and bug reports should be submitted constructively. Abuse of the reporting system for frivolous or malicious purposes is prohibited.', severity: 'important' },
      { number: '25.13', text: 'Users shall log out of the platform when not in active use on shared or public devices.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 26. COMMUNICATION STANDARDS
  // ══════════════════════════════════════════════
  {
    id: 'communication-standards',
    title: 'Communication Standards',
    icon: 'MessageCircle',
    description: 'Standards for all forms of communication — written, verbal, and digital — on the DiplomatiQ platform.',
    rules: [
      { number: '26.1', text: 'All communications on the DiplomatiQ platform — including chat messages, forum posts, video calls, and emails — shall be professional, respectful, and on-topic.', severity: 'mandatory' },
      { number: '26.2', text: 'Profanity, vulgarity, hate speech, and offensive language are strictly prohibited in all platform communications.', severity: 'mandatory' },
      { number: '26.3', text: 'Delegates shall use their registered name and country affiliation in all communications. Anonymous or pseudonymous communication is not permitted.', severity: 'mandatory' },
      { number: '26.4', text: 'Private messages shall not be used for harassment, intimidation, solicitation, or any purpose that violates this Code of Conduct.', severity: 'mandatory' },
      { number: '26.5', text: 'Formal communications (position papers, resolutions, official notes) shall follow diplomatic language conventions and maintain professional tone.', severity: 'important' },
      { number: '26.6', text: 'Spamming, flooding, or sending excessive messages in chat channels is prohibited and may result in temporary chat restriction.', severity: 'mandatory' },
      { number: '26.7', text: 'Users shall not send unsolicited files, links to malicious websites, or content that could compromise other users\' security.', severity: 'mandatory' },
      { number: '26.8', text: 'Communication in channels designated for specific purposes (e.g., resolution drafting, crisis notes) shall remain on-topic.', severity: 'important' },
      { number: '26.9', text: 'Multilingual communication is welcome, but a common working language shall be maintained in shared channels to ensure inclusivity.', severity: 'recommended' },
      { number: '26.10', text: 'Users shall not quote or share private communications in public channels without the original sender\'s consent.', severity: 'important' },
      { number: '26.11', text: 'Constructive criticism and respectful disagreement are encouraged. Personal attacks disguised as criticism are not acceptable.', severity: 'important' },
      { number: '26.12', text: 'Communications involving minors are subject to additional safeguarding protocols and may be monitored for safety purposes.', severity: 'mandatory' },
    ],
  },

  // ══════════════════════════════════════════════
  // 27. SOCIAL MEDIA POLICY
  // ══════════════════════════════════════════════
  {
    id: 'social-media',
    title: 'Social Media Policy',
    icon: 'Share2',
    description: 'Rules governing social media activity related to DiplomatiQ and MUN conferences.',
    rules: [
      { number: '27.1', text: 'Participants shall not post photographs, videos, or audio recordings of other participants on social media without their explicit consent.', severity: 'mandatory' },
      { number: '27.2', text: 'Social media posts about conferences or platform activities shall be accurate and not misrepresent proceedings, outcomes, or other participants\' views.', severity: 'important' },
      { number: '27.3', text: 'Delegates shall not use social media to harass, bully, shame, or intimidate other participants before, during, or after conferences.', severity: 'mandatory' },
      { number: '27.4', text: 'Confidential information about crisis committees, including plot details and updates, shall not be shared on social media during the conference.', severity: 'mandatory' },
      { number: '27.5', text: 'Participants shall not create fake social media accounts impersonating other delegates, the Secretariat, or the DiplomatiQ platform.', severity: 'mandatory' },
      { number: '27.6', text: 'Official conference hashtags and social media channels should be used for public posts. Participants are encouraged to share positive experiences constructively.', severity: 'recommended' },
      { number: '27.7', text: 'The DiplomatiQ platform may be referenced on social media, but users shall not claim to represent the platform or speak on its behalf without authorization.', severity: 'important' },
      { number: '27.8', text: 'Negative experiences or complaints shall be addressed through official channels rather than public social media posts that could damage reputations unfairly.', severity: 'important' },
      { number: '27.9', text: 'Screenshots of private platform communications (chat messages, notes, emails) shall not be posted on social media without all parties\' consent.', severity: 'mandatory' },
      { number: '27.10', text: 'Social media activity that violates this Code of Conduct may result in disciplinary action, including platform suspension and conference disqualification.', severity: 'mandatory' },
      { number: '27.11', text: 'Conference-specific social media policies, when provided by the Secretariat, shall be followed in addition to these platform-wide rules.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 28. DATA PRIVACY & PROTECTION
  // ══════════════════════════════════════════════
  {
    id: 'data-privacy',
    title: 'Data Privacy & Protection',
    icon: 'Lock',
    description: 'Policies for protecting personal data, privacy rights, and information security on the platform.',
    rules: [
      { number: '28.1', text: 'The DiplomatiQ platform complies with applicable data protection laws, including GDPR, COPPA, and UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection.', severity: 'mandatory' },
      { number: '28.2', text: 'Users shall not collect, store, or distribute personal information about other participants without their knowledge and consent.', severity: 'mandatory' },
      { number: '28.3', text: 'Personal data shared during registration (name, email, school, age) shall be used only for the purposes stated in the Privacy Policy and shall not be sold to third parties.', severity: 'mandatory' },
      { number: '28.4', text: 'Users have the right to access, correct, and delete their personal data held by the platform, subject to legitimate retention requirements.', severity: 'important' },
      { number: '28.5', text: 'Delegates shall not photograph, record, or screenshot other participants without their consent, particularly in virtual settings.', severity: 'mandatory' },
      { number: '28.6', text: 'Academic records, assessment scores, and disciplinary information are confidential and shall not be disclosed to unauthorized parties.', severity: 'mandatory' },
      { number: '28.7', text: 'Analytics data collected by the platform is used solely for improving educational outcomes and platform functionality, not for commercial profiling of students.', severity: 'important' },
      { number: '28.8', text: 'Data breaches involving personal information shall be reported to affected users and relevant authorities within the timeframes required by applicable law.', severity: 'mandatory' },
      { number: '28.9', text: 'Users under 18 require parental consent for data processing. The platform shall provide clear, age-appropriate privacy notices.', severity: 'mandatory' },
      { number: '28.10', text: 'Cookies and tracking technologies shall be used transparently, with users given the option to manage their preferences.', severity: 'important' },
      { number: '28.11', text: 'Third-party integrations (payment processors, video conferencing) are subject to the same data protection standards. The platform shall ensure contractual compliance.', severity: 'important' },
      { number: '28.12', text: 'Users shall not attempt to access, download, or scrape personal data of other users from the platform through any means.', severity: 'mandatory' },
    ],
  },

  // ══════════════════════════════════════════════
  // 29. ANTI-HARASSMENT POLICY
  // ══════════════════════════════════════════════
  {
    id: 'anti-harassment',
    title: 'Anti-Harassment Policy',
    icon: 'ShieldCheck',
    description: 'Zero-tolerance policy for harassment, bullying, and hostile behavior in all contexts.',
    rules: [
      { number: '29.1', text: 'DiplomatiQ maintains a zero-tolerance policy toward harassment in any form, including but not limited to: verbal, physical, visual, and digital harassment.', severity: 'mandatory' },
      { number: '29.2', text: 'Sexual harassment — including unwelcome advances, inappropriate comments, requests for sexual favors, and any conduct of a sexual nature — is strictly prohibited.', severity: 'mandatory' },
      { number: '29.3', text: 'Harassment based on race, ethnicity, nationality, religion, gender, sexual orientation, disability, age, or socioeconomic status is strictly prohibited.', severity: 'mandatory' },
      { number: '29.4', text: 'Cyberbullying — including persistent negative messaging, spreading rumors online, creating hostile digital environments, and doxxing — is prohibited.', severity: 'mandatory' },
      { number: '29.5', text: 'Retaliation against anyone who reports harassment in good faith is strictly prohibited and will be treated as a separate violation.', severity: 'mandatory' },
      { number: '29.6', text: 'All harassment reports will be taken seriously and investigated promptly, impartially, and confidentially to the extent possible.', severity: 'mandatory' },
      { number: '29.7', text: 'Participants who experience harassment are encouraged to report it immediately to a designated safeguarding officer, the Chair, their advisor, or through the platform\'s reporting system.', severity: 'mandatory' },
      { number: '29.8', text: 'False accusations of harassment made maliciously constitute a serious violation of this Code and will result in disciplinary action.', severity: 'mandatory' },
      { number: '29.9', text: 'The platform shall provide support resources to individuals who report harassment, including access to counseling and mediation services where appropriate.', severity: 'important' },
      { number: '29.10', text: 'Bystanders who witness harassment are encouraged to intervene safely, report the incident, or offer support to the affected individual.', severity: 'recommended' },
      { number: '29.11', text: 'Harassment that occurs outside of official platform activities but involves DiplomatiQ participants may still be subject to this policy if it affects the platform community.', severity: 'important' },
      { number: '29.12', text: 'Organizers and leaders bear heightened responsibility to prevent and address harassment in their committees and teams.', severity: 'important' },
      { number: '29.13', text: 'Confirmed harassment violations will result in immediate removal from the current activity and may result in permanent platform suspension.', severity: 'mandatory' },
    ],
  },

  // ══════════════════════════════════════════════
  // 30. ANTI-DISCRIMINATION POLICY
  // ══════════════════════════════════════════════
  {
    id: 'anti-discrimination',
    title: 'Anti-Discrimination Policy',
    icon: 'Scale',
    description: 'Commitment to equality and non-discrimination across all platform activities and conferences.',
    rules: [
      { number: '30.1', text: 'No participant shall be discriminated against on the basis of race, ethnicity, nationality, color, religion, gender, gender identity, sexual orientation, age, disability, socioeconomic status, or political belief.', severity: 'mandatory' },
      { number: '30.2', text: 'Equal opportunity for participation, leadership roles, and recognition shall be provided regardless of personal background or identity.', severity: 'mandatory' },
      { number: '30.3', text: 'Accessibility accommodations shall be provided for participants with disabilities to ensure full and meaningful participation.', severity: 'mandatory' },
      { number: '30.4', text: 'Stereotyping of any national, ethnic, religious, or cultural group — even within the context of a simulation — is prohibited.', severity: 'mandatory' },
      { number: '30.5', text: 'The platform shall ensure that its features, content, and design are accessible and inclusive, following WCAG 2.1 AA guidelines where feasible.', severity: 'important' },
      { number: '30.6', text: 'Conference leadership positions (Chairs, Secretariat) shall be selected based on merit and qualification, free from discriminatory bias.', severity: 'mandatory' },
      { number: '30.7', text: 'Awards and recognition shall be based on performance criteria applied equally to all delegates, without bias toward or against any demographic group.', severity: 'mandatory' },
      { number: '30.8', text: 'Microaggressions — subtle but harmful expressions of bias — shall be taken seriously and addressed constructively when reported.', severity: 'important' },
      { number: '30.9', text: 'Cultural competency training is recommended for all Chairs and Secretariat members to promote inclusive conference environments.', severity: 'recommended' },
      { number: '30.10', text: 'Pronouns and preferred names shall be respected. Deliberate misgendering or use of incorrect names after correction constitutes discriminatory behavior.', severity: 'mandatory' },
      { number: '30.11', text: 'Dietary restrictions based on religious or cultural practices shall be accommodated at conference events providing food.', severity: 'important' },
      { number: '30.12', text: 'Prayer rooms, meditation spaces, or quiet rooms shall be made available at conference venues when feasible.', severity: 'recommended' },
    ],
  },

  // ══════════════════════════════════════════════
  // 31. HEALTH & SAFETY
  // ══════════════════════════════════════════════
  {
    id: 'health-safety',
    title: 'Health & Safety',
    icon: 'Heart',
    description: 'Health and safety standards for all in-person and virtual MUN activities.',
    rules: [
      { number: '31.1', text: 'The physical and mental well-being of all participants is the highest priority and shall take precedence over all conference activities and logistics.', severity: 'mandatory' },
      { number: '31.2', text: 'Conference venues shall meet all applicable health and safety regulations, including fire safety, occupancy limits, and accessibility standards.', severity: 'mandatory' },
      { number: '31.3', text: 'First aid equipment and trained personnel shall be available at all in-person conference venues during operating hours.', severity: 'mandatory' },
      { number: '31.4', text: 'Delegates who feel unwell during any activity shall inform the Chair, their advisor, or a designated safety officer immediately. No delegate shall be penalized for health-related absences.', severity: 'mandatory' },
      { number: '31.5', text: 'Mental health support shall be available, and delegates experiencing stress, anxiety, or emotional distress shall be encouraged to seek assistance without stigma.', severity: 'important' },
      { number: '31.6', text: 'Infectious disease protocols (as applicable) shall be followed, including any vaccination, testing, masking, or social distancing requirements in effect at the time of the conference.', severity: 'mandatory' },
      { number: '31.7', text: 'Allergies and medical conditions shall be communicated to conference organizers through the designated medical information form prior to the event.', severity: 'important' },
      { number: '31.8', text: 'Participants shall not consume alcohol or use recreational drugs during conference activities or in conference venues. Violations will result in immediate removal.', severity: 'mandatory' },
      { number: '31.9', text: 'Adequate rest breaks shall be provided between sessions. Conferences shall not schedule activities that unreasonably deprive participants of sleep.', severity: 'important' },
      { number: '31.10', text: 'Hydration and nutrition shall be accessible during conference hours. Delegates shall not be expected to skip meals for committee work.', severity: 'important' },
      { number: '31.11', text: 'For virtual sessions, participants shall be encouraged to take regular screen breaks and maintain ergonomic practices to prevent physical strain.', severity: 'recommended' },
      { number: '31.12', text: 'In the event of a medical emergency, all conference activities shall be suspended until the situation is resolved and the affected individual receives appropriate care.', severity: 'mandatory' },
    ],
  },

  // ══════════════════════════════════════════════
  // 32. EMERGENCY PROCEDURES
  // ══════════════════════════════════════════════
  {
    id: 'emergency-procedures',
    title: 'Emergency Procedures',
    icon: 'Siren',
    description: 'Protocols for responding to emergencies, evacuations, and critical incidents.',
    rules: [
      { number: '32.1', text: 'All participants shall familiarize themselves with emergency exits, assembly points, and evacuation routes upon arriving at any conference venue.', severity: 'mandatory' },
      { number: '32.2', text: 'In the event of a fire, natural disaster, security threat, or other emergency, all participants shall follow the instructions of designated safety personnel without delay.', severity: 'mandatory' },
      { number: '32.3', text: 'Emergency contact information for all delegates under 18 must be on file with the conference organizers prior to the event.', severity: 'mandatory' },
      { number: '32.4', text: 'A designated emergency response coordinator shall be identified at each conference and shall be reachable at all times during the event.', severity: 'mandatory' },
      { number: '32.5', text: 'Medical emergencies shall be addressed immediately by calling local emergency services. First aid shall be administered by trained personnel while awaiting professional help.', severity: 'mandatory' },
      { number: '32.6', text: 'In the event of a security threat or active emergency, delegates shall follow lockdown or evacuation procedures as directed and shall not attempt to leave the designated safe area.', severity: 'mandatory' },
      { number: '32.7', text: 'Delegates shall not spread rumors or unverified information during emergency situations. Official communications shall come from designated spokespersons only.', severity: 'important' },
      { number: '32.8', text: 'Post-incident support, including counseling and debriefing, shall be made available to all affected participants following any emergency.', severity: 'important' },
      { number: '32.9', text: 'All emergency incidents shall be documented and reported to the DiplomatiQ platform for review and incorporation into future safety planning.', severity: 'important' },
      { number: '32.10', text: 'Virtual conference emergencies (technical failures, security breaches, participant distress) shall be addressed by the Chair or session host with appropriate urgency.', severity: 'important' },
      { number: '32.11', text: 'Parents and guardians shall be notified promptly of any emergency affecting their child, in accordance with the emergency contact information on file.', severity: 'mandatory' },
      { number: '32.12', text: 'Emergency drills, when conducted, shall be taken seriously by all participants. Disruptive or dismissive behavior during drills is prohibited.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 33. DRESS CODE & PROFESSIONAL APPEARANCE
  // ══════════════════════════════════════════════
  {
    id: 'dress-code',
    title: 'Dress Code & Professional Appearance',
    icon: 'Shirt',
    description: 'Standards for professional attire and personal presentation at MUN events.',
    rules: [
      { number: '33.1', text: 'All participants shall wear business formal attire during conference sessions, opening and closing ceremonies, and any official MUN events.', severity: 'mandatory' },
      { number: '33.2', text: 'Business formal attire typically includes suits, dress shirts, blazers, ties, dress pants, skirts, or equivalent professional garments appropriate to a diplomatic setting.', severity: 'important' },
      { number: '33.3', text: 'Cultural and religious attire is always welcome and respected. No participant shall be required to compromise their cultural or religious dress practices.', severity: 'mandatory' },
      { number: '33.4', text: 'National dress of the country being represented is appropriate and encouraged, provided it meets the standard of formality expected at a diplomatic event.', severity: 'recommended' },
      { number: '33.5', text: 'Casual attire including jeans, t-shirts, athletic wear, flip-flops, and shorts is not appropriate for formal committee sessions.', severity: 'mandatory' },
      { number: '33.6', text: 'For virtual sessions, participants shall maintain the same standard of professional appearance from the waist up, ensuring visible attire is business formal.', severity: 'important' },
      { number: '33.7', text: 'Delegates shall not wear clothing bearing political slogans, offensive imagery, or messaging that could disrupt the diplomatic atmosphere of the conference.', severity: 'mandatory' },
      { number: '33.8', text: 'The Chair and Secretariat shall model the dress code standard. If a staff member is inappropriately dressed, the matter shall be addressed privately.', severity: 'important' },
      { number: '33.9', text: 'Delegates who arrive inappropriately dressed may be asked to change before being admitted to the committee room. This shall be handled discreetly and respectfully.', severity: 'important' },
      { number: '33.10', text: 'Conference-specific dress requirements, such as themed events or ceremonial attire, shall be communicated well in advance and participation shall be optional.', severity: 'recommended' },
      { number: '33.11', text: 'Accessories and jewelry should be modest and professional. Excessively casual or distracting accessories are not appropriate for diplomatic settings.', severity: 'recommended' },
      { number: '33.12', text: 'Footwear should be professional and appropriate for the venue. Athletic shoes and casual sandals are not acceptable for formal sessions.', severity: 'important' },
      { number: '33.13', text: 'Personal protective equipment, when required by health regulations, shall not be considered a violation of the dress code and shall be worn as directed.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 34. INTELLECTUAL PROPERTY
  // ══════════════════════════════════════════════
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    icon: 'Copyright',
    description: 'Rules protecting intellectual property rights on the DiplomatiQ platform.',
    rules: [
      { number: '34.1', text: 'All content created by participants (position papers, resolutions, speeches, research) remains the intellectual property of the creator, subject to the platform\'s license terms.', severity: 'mandatory' },
      { number: '34.2', text: 'By submitting content to the DiplomatiQ platform, users grant the platform a non-exclusive license to use, store, and display the content for educational and platform purposes.', severity: 'important' },
      { number: '34.3', text: 'Participants shall not reproduce, distribute, or commercially exploit content created by other participants without their express written permission.', severity: 'mandatory' },
      { number: '34.4', text: 'Conference background guides, study materials, and procedural guides are the intellectual property of the conference organizing team and shall not be distributed without authorization.', severity: 'important' },
      { number: '34.5', text: 'The DiplomatiQ platform name, logo, brand assets, and proprietary content may not be used by participants for commercial purposes or to imply endorsement.', severity: 'mandatory' },
      { number: '34.6', text: 'Images, charts, and infographics used in presentations must be properly attributed. Use of copyrighted images without permission or fair use justification is prohibited.', severity: 'mandatory' },
      { number: '34.7', text: 'Open-source and Creative Commons-licensed materials shall be used in accordance with their specific license terms, including attribution requirements.', severity: 'important' },
      { number: '34.8', text: 'Delegates shall not record, transcribe, or redistribute recorded committee sessions without the consent of all participants and the conference Secretariat.', severity: 'mandatory' },
      { number: '34.9', text: 'Teachers may use student work produced on the platform for educational purposes within their institution, provided the student is informed.', severity: 'important' },
      { number: '34.10', text: 'Algorithmic outputs generated by the DiplomatiQ platform (AI evaluations, assessments) are the property of the platform and may not be reverse-engineered or redistributed.', severity: 'important' },
      { number: '34.11', text: 'Participants who believe their intellectual property has been infringed on the platform may submit a takedown request through the designated process.', severity: 'important' },
    ],
  },

  // ══════════════════════════════════════════════
  // 35. COMPLIANCE & ENFORCEMENT
  // ══════════════════════════════════════════════
  {
    id: 'compliance-enforcement',
    title: 'Compliance & Enforcement',
    icon: 'ShieldAlert',
    description: 'Enforcement mechanisms, disciplinary procedures, and appeals processes for Code violations.',
    rules: [
      { number: '35.1', text: 'Violations of this Code of Conduct are categorized as minor, moderate, or severe, with corresponding escalating consequences.', severity: 'mandatory' },
      { number: '35.2', text: 'Minor violations (first-time procedural errors, minor dress code issues) shall result in a verbal warning from the Chair or designated authority.', severity: 'important' },
      { number: '35.3', text: 'Moderate violations (repeated procedural violations, disrespectful behavior, minor academic integrity issues) shall result in a written warning and may affect participation scores.', severity: 'important' },
      { number: '35.4', text: 'Severe violations (harassment, plagiarism, threats, fraud, substance use) shall result in immediate removal from the activity and potential permanent platform suspension.', severity: 'mandatory' },
      { number: '35.5', text: 'All disciplinary actions shall follow due process. The accused party has the right to know the allegations, present their perspective, and appeal the decision.', severity: 'mandatory' },
      { number: '35.6', text: 'The Secretariat has final authority on all disciplinary matters during conferences. The DiplomatiQ platform administration has final authority on platform-related matters.', severity: 'mandatory' },
      { number: '35.7', text: 'Disciplinary records shall be maintained confidentially and shall not be disclosed to unauthorized parties.', severity: 'mandatory' },
      { number: '35.8', text: 'Appeals of disciplinary decisions must be submitted in writing within 48 hours of the decision. Appeals shall be reviewed by an impartial party not involved in the original decision.', severity: 'important' },
      { number: '35.9', text: 'Repeat offenders shall face progressively severe consequences. The platform maintains a record of violations across conferences and activities.', severity: 'important' },
      { number: '35.10', text: 'In cases involving potential criminal conduct, the platform will cooperate with law enforcement authorities as required by law.', severity: 'mandatory' },
      { number: '35.11', text: 'Amnesty may be granted for self-reported violations in certain circumstances, particularly when the report leads to the identification of more serious misconduct.', severity: 'recommended' },
      { number: '35.12', text: 'Schools and institutions will be notified of serious violations involving their students, in accordance with the platform\'s reporting protocols and applicable privacy laws.', severity: 'important' },
      { number: '35.13', text: 'The enforcement of this Code applies equally to all participants regardless of their role, experience level, or institutional affiliation.', severity: 'mandatory' },
      { number: '35.14', text: 'The DiplomatiQ platform shall maintain a transparent record of enforcement actions (in anonymized aggregate form) to promote accountability and trust.', severity: 'recommended' },
    ],
  },

  // ══════════════════════════════════════════════
  // 36. ACKNOWLEDGMENT & AGREEMENT
  // ══════════════════════════════════════════════
  {
    id: 'acknowledgment-agreement',
    title: 'Acknowledgment & Agreement',
    icon: 'CheckCircle2',
    description: 'Final section requiring acknowledgment and agreement to all terms of the Code of Conduct.',
    rules: [
      { number: '36.1', text: 'All participants must read, understand, and acknowledge this Code of Conduct before accessing the full DiplomatiQ platform features.', severity: 'mandatory' },
      { number: '36.2', text: 'By creating an account on the DiplomatiQ platform, users confirm that they have read and agree to be bound by all 36 sections of this Code of Conduct.', severity: 'mandatory' },
      { number: '36.3', text: 'Participants under the age of 18 must obtain parental or guardian acknowledgment of this Code of Conduct before participating.', severity: 'mandatory' },
      { number: '36.4', text: 'Acknowledgment must be renewed whenever the Code of Conduct is materially updated. Users will be notified of changes and required to re-acknowledge.', severity: 'mandatory' },
      { number: '36.5', text: 'Failure to acknowledge the Code of Conduct does not exempt a participant from its provisions. Use of the platform constitutes acceptance.', severity: 'mandatory' },
      { number: '36.6', text: 'Participants who disagree with specific provisions of this Code should address their concerns through the platform\'s feedback channels before participating.', severity: 'recommended' },
      { number: '36.7', text: 'Teachers and advisors are responsible for ensuring that all students under their supervision have acknowledged this Code before participation.', severity: 'important' },
      { number: '36.8', text: 'The acknowledgment record, including the date and version of the Code acknowledged, shall be maintained by the platform for each user.', severity: 'important' },
      { number: '36.9', text: 'Withdrawal of acknowledgment after participation has begun does not negate responsibility for conduct during the period of participation.', severity: 'important' },
      { number: '36.10', text: 'Institutions (schools, organizations) that register teams for conferences affirm that their participants have acknowledged this Code.', severity: 'mandatory' },
      { number: '36.11', text: 'The DiplomatiQ platform reserves the right to suspend access for users who have not completed the acknowledgment process.', severity: 'mandatory' },
      { number: '36.12', text: 'This Code of Conduct represents the complete agreement between the participant and the DiplomatiQ platform regarding standards of conduct, superseding any prior agreements.', severity: 'important' },
      { number: '36.13', text: 'By acknowledging this Code, participants confirm their understanding that violations may result in disciplinary action, suspension, or permanent removal from the platform.', severity: 'mandatory' },
      { number: '36.14', text: 'The effective date of this Code of Conduct is September 2026. All participants are bound by the version in effect at the time of their activity.', severity: 'important' },
      { number: '36.15', text: 'Questions about any provision of this Code should be directed to the DiplomatiQ support team before acknowledging. Participants are encouraged to seek clarification on any unclear terms.', severity: 'recommended' },
    ],
  },
]

// Compute total rules count
export const TOTAL_RULES = SECTIONS.reduce((sum, s) => sum + s.rules.length, 0)
