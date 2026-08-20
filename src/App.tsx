import {
  AlertTriangle,
  Archive,
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Database,
  Download,
  Edit3,
  Eye,
  FileText,
  FolderKanban,
  Gauge,
  GitBranch,
  HelpCircle,
  LayoutDashboard,
  MessageSquareText,
  MonitorDot,
  Paintbrush,
  PanelRightOpen,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ViewId = "inbox" | "project" | "transcript" | "team" | "reports" | "admin";
type CategoryId = "ux" | "frontend" | "backend" | "data";
type DiagramId = "ui" | "architecture" | "pipeline";
type Tone = "brand" | "success" | "warning" | "error" | "info" | "neutral";
type ProjectStatus = "Kickoff review" | "In discovery" | "Blocked" | "Ready for approval";
type Feasibility = "Green" | "Yellow" | "Red";

type NavItem = {
  id: ViewId;
  icon: LucideIcon;
  label: string;
  meta: string;
};

type TeamMember = {
  assets: string[];
  capacity: number;
  focus: string;
  initials: string;
  name: string;
  pings: number;
  role: string;
  status: "Reviewing" | "Needs ping" | "Clear" | "Blocked";
  tone: Tone;
};

type Question = {
  askedBy: string;
  assignee: string;
  category: string;
  question: string;
  status: "Asked live" | "Pending" | "Team requested" | "Answered";
  time: string;
};

type ReportAsset = {
  assignee: string;
  category: string;
  description: string;
  evidence: string;
  icon: LucideIcon;
  status: string;
  title: string;
  tone: Tone;
};

type TranscriptEvent = {
  actor: string;
  content: string;
  marker: string;
  time: string;
};

type ActionItem = {
  label: string;
  meta: string;
  tone: Tone;
};

type CapabilityRow = {
  capability: string;
  coverage: "Covered" | "Needs review" | "Blocked";
  evidence: string;
  owner: string;
};

type CategoryReview = {
  evidence: string;
  state: string;
  tone: Tone;
};

type MeetingSlot = {
  agenda: string;
  attendees: number;
  botAccess: "Ready" | "Needs approval" | "Paused";
  business: string;
  host: string;
  id: string;
  projectId: string;
  recommended: boolean;
  status: string;
  time: string;
  title: string;
  tone: Tone;
};

type FlowStage = {
  detail: string;
  owner: string;
  title: string;
  tone: Tone;
};

type Project = {
  actionQueue: ActionItem[];
  botState: string;
  capabilityRows: CapabilityRow[];
  categoryReviews: Record<CategoryId, CategoryReview>;
  diagramNodes: Record<DiagramId, string[]>;
  feasibility: Feasibility;
  id: string;
  lastSynced: string;
  name: string;
  openRisks: number;
  ownerNote: string;
  questions: Question[];
  reportAssets: ReportAsset[];
  shortName: string;
  status: ProjectStatus;
  subtitle: string;
  summary: string;
  team: TeamMember[];
  teamPings: number;
  transcriptCoverage: number;
  transcriptEvents: TranscriptEvent[];
};

type ProjectDraft = Partial<Pick<Project, "feasibility" | "lastSynced" | "name" | "ownerNote" | "status" | "summary">>;

const navItems: NavItem[] = [
  { id: "admin", icon: Settings, label: "Admin command", meta: "Teams connector" },
  { id: "inbox", icon: LayoutDashboard, label: "Designer review", meta: "Mockups to approve" },
  { id: "project", icon: FolderKanban, label: "Projects", meta: "Scope and edits" },
  { id: "transcript", icon: MessageSquareText, label: "Transcripts", meta: "Calls and chat" },
  { id: "team", icon: Users, label: "Team visibility", meta: "Members and pings" },
  { id: "reports", icon: FileText, label: "Review packets", meta: "Assets by owner" },
];

const categories: Array<{ id: CategoryId; label: string; output: string; listensFor: string; tone: Tone }> = [
  {
    id: "ux",
    label: "UX/UI",
    listensFor: "Screens, flows, user needs, accessibility needs",
    output: "Notes plus suggested diagram",
    tone: "brand",
  },
  {
    id: "frontend",
    label: "Front end",
    listensFor: "Frameworks, components, browser support, constraints",
    output: "Stack summary and component notes",
    tone: "success",
  },
  {
    id: "backend",
    label: "Back end / Architecture",
    listensFor: "Services, integrations, auth, hosting, Teams path",
    output: "Suggested architecture diagram",
    tone: "warning",
  },
  {
    id: "data",
    label: "Data / Databases",
    listensFor: "Data sources, transcript storage, pipelines, retention",
    output: "Suggested data pipeline diagram",
    tone: "error",
  },
];

const operatingFlow: FlowStage[] = [
  {
    detail: "PM creates the opportunity record after a business reaches out.",
    owner: "PM / Admin",
    title: "Business intake",
    tone: "info",
  },
  {
    detail: "Admin chooses the Teams meeting, project, and visible reviewers before Baymax joins.",
    owner: "Baymax admin",
    title: "Send bot to kickoff",
    tone: "brand",
  },
  {
    detail: "Baymax captures scope, flows, users, systems, constraints, and unanswered questions.",
    owner: "Baymax",
    title: "Listen and ask",
    tone: "warning",
  },
  {
    detail: "Baymax turns the meeting into first-pass wireframes, diagrams, and review notes.",
    owner: "Baymax",
    title: "Generate drafts",
    tone: "brand",
  },
  {
    detail: "Design, front end, back end, and data owners edit or approve their sections.",
    owner: "Team reviewers",
    title: "Review packet",
    tone: "success",
  },
  {
    detail: "Approved drafts go back to the business so the PM can confirm direction.",
    owner: "PM / Admin",
    title: "Business handoff",
    tone: "info",
  },
  {
    detail: "If accepted, the real team joins the project with a faster, cleaner starting point.",
    owner: "Business + team",
    title: "Approve or deny",
    tone: "success",
  },
];

const meetingSlots: MeetingSlot[] = [
  {
    agenda: "Initial Teams kickoff for dashboard automation, UX flows, transcript handling, and delivery feasibility.",
    attendees: 8,
    botAccess: "Ready",
    business: "Northstar Operations",
    host: "PM Lead",
    id: "apollo-kickoff",
    projectId: "apollo",
    recommended: true,
    status: "Kickoff scheduled",
    time: "Today, 4:30 PM",
    title: "Apollo discovery kickoff",
    tone: "brand",
  },
  {
    agenda: "Follow-up with data and architecture owners for retention, transcript access, and Teams permissions.",
    attendees: 5,
    botAccess: "Needs approval",
    business: "Northstar Operations",
    host: "Delivery Lead",
    id: "apollo-data-review",
    projectId: "apollo",
    recommended: false,
    status: "Permission review",
    time: "Tomorrow, 10:00 AM",
    title: "Apollo data access review",
    tone: "warning",
  },
  {
    agenda: "Customer portal intake covering order tracking, exception handling, mobile operations, and source-of-truth decisions.",
    attendees: 7,
    botAccess: "Ready",
    business: "Meridian Retail Group",
    host: "Product Manager",
    id: "meridian-kickoff",
    projectId: "meridian",
    recommended: true,
    status: "Kickoff ready",
    time: "Today, 2:00 PM",
    title: "Meridian customer portal kickoff",
    tone: "success",
  },
  {
    agenda: "Leadership reporting intake with governance, warehouse ownership, BI export, and project approval gates.",
    attendees: 10,
    botAccess: "Paused",
    business: "Atlas Leadership Council",
    host: "Executive PM",
    id: "atlas-leadership",
    projectId: "atlas",
    recommended: true,
    status: "Blocked by governance",
    time: "Monday, 9:30 AM",
    title: "Atlas leadership reporting kickoff",
    tone: "error",
  },
  {
    agenda: "Decision meeting to confirm whether Atlas should proceed, pause, or return to the business for scope reduction.",
    attendees: 6,
    botAccess: "Needs approval",
    business: "Atlas Leadership Council",
    host: "Delivery Lead",
    id: "atlas-decision",
    projectId: "atlas",
    recommended: false,
    status: "Decision gate",
    time: "Thursday, 11:15 AM",
    title: "Atlas feasibility decision",
    tone: "warning",
  },
];

const projects: Project[] = [
  {
    actionQueue: [
      { label: "Review UI flow diagram", meta: "Generated from screens and user needs", tone: "brand" },
      { label: "Confirm dashboard module order", meta: "Project summary, monitor, diagrams, questions", tone: "warning" },
      { label: "Approve UX notes for proposal", meta: "Required before final project packet", tone: "success" },
      { label: "Reply to retention visibility question", meta: "Data owner needs dashboard access expectations", tone: "info" },
    ],
    botState: "Listening",
    capabilityRows: [
      { capability: "UX/UI flows", coverage: "Covered", evidence: "Current design-library patterns available", owner: "Gurney" },
      { capability: "Front-end build", coverage: "Covered", evidence: "React/Tailwind stack aligns", owner: "Front End Lead" },
      { capability: "Teams integration", coverage: "Needs review", evidence: "Bot Framework and Graph path unresolved", owner: "Back End Lead" },
      { capability: "Data retention", coverage: "Blocked", evidence: "Storage and access policy needed", owner: "Data Owner" },
    ],
    categoryReviews: {
      ux: { evidence: "Transcript markers 15:12, 15:42, 16:09", state: "Ready for designer review", tone: "brand" },
      frontend: { evidence: "Framework and component constraints captured from kickoff", state: "Ready for owner review", tone: "success" },
      backend: { evidence: "Teams integration path needs technical decision", state: "Risk review", tone: "warning" },
      data: { evidence: "Retention answer pending from data owner", state: "Blocked by retention answer", tone: "error" },
    },
    diagramNodes: {
      ui: ["Designer inbox", "Project dashboard", "Transcript markers", "Reports and assets"],
      architecture: ["Teams call", "Baymax bot", "Intake framework", "Admin dashboard"],
      pipeline: ["Transcript store", "Structured proposal", "Report assets", "Review archive"],
    },
    feasibility: "Yellow",
    id: "apollo",
    lastSynced: "Today at 4:26 PM",
    name: "Project Apollo",
    openRisks: 2,
    ownerNote: "Prioritize the designer handoff and make data retention visible before pilot approval.",
    questions: [
      {
        askedBy: "Baymax",
        assignee: "Gurney",
        category: "UX/UI",
        question: "Which user flows need to be visible in the first generated diagram?",
        status: "Asked live",
        time: "15:42",
      },
      {
        askedBy: "Baymax",
        assignee: "Data Owner",
        category: "Data",
        question: "What retention policy should apply to Teams transcripts and generated reports?",
        status: "Pending",
        time: "16:04",
      },
      {
        askedBy: "Front End Lead",
        assignee: "Baymax",
        category: "Front end",
        question: "Ask next kickoff group about supported component library and browser constraints.",
        status: "Team requested",
        time: "16:11",
      },
      {
        askedBy: "Baymax",
        assignee: "Back End Lead",
        category: "Architecture",
        question: "Will the Teams bot use Bot Framework events, Graph subscriptions, or both?",
        status: "Answered",
        time: "16:18",
      },
    ],
    reportAssets: [
      {
        assignee: "Gurney",
        category: "UX/UI",
        description: "Screen inventory, primary flows, states, and review notes extracted from kickoff.",
        evidence: "Transcript markers 15:12, 15:42, 16:09",
        icon: Paintbrush,
        status: "Needs designer review",
        title: "UX/UI kickoff packet",
        tone: "brand",
      },
      {
        assignee: "Gurney",
        category: "Visual asset",
        description: "Editable flow diagram draft for dashboard screens, generated from user needs and screens mentioned.",
        evidence: "Generated after question Q-014",
        icon: Workflow,
        status: "Regenerate available",
        title: "Project view flow map",
        tone: "info",
      },
      {
        assignee: "Front End Lead",
        category: "Front end",
        description: "Frameworks, components, constraints, and unknowns routed for implementation review.",
        evidence: "Teams chat plus kickoff transcript",
        icon: MonitorDot,
        status: "Ready to approve",
        title: "Front-end stack summary",
        tone: "success",
      },
      {
        assignee: "Back End Lead",
        category: "Architecture",
        description: "Service boundaries, Teams integration options, Graph API access, and compliance concerns.",
        evidence: "Open concerns section and call marker 16:18",
        icon: GitBranch,
        status: "Risk review",
        title: "Architecture diagram",
        tone: "warning",
      },
      {
        assignee: "Data Owner",
        category: "Data",
        description: "Data sources, transcript storage, generated report access, and retention gaps.",
        evidence: "Pending answer from Q-021",
        icon: Database,
        status: "Blocked",
        title: "Data pipeline diagram",
        tone: "error",
      },
    ],
    shortName: "Apollo",
    status: "Kickoff review",
    subtitle: "Teams kickoff assistant dashboard",
    summary:
      "Baymax captured a kickoff-only meeting brief and converted it into a reviewable proposal with technical categories, generated visuals, open questions, and routed team approvals.",
    team: [
      {
        assets: ["UI flow diagram", "Screen inventory", "UX risks report"],
        capacity: 68,
        focus: "Screens, flows, accessibility notes, review handoff",
        initials: "GK",
        name: "Gurney",
        pings: 4,
        role: "UX/UI Front End Designer",
        status: "Reviewing",
        tone: "brand",
      },
      {
        assets: ["Stack summary", "Component constraints"],
        capacity: 74,
        focus: "React framework notes, component strategy, build constraints",
        initials: "FE",
        name: "Front End Lead",
        pings: 2,
        role: "Front End",
        status: "Clear",
        tone: "success",
      },
      {
        assets: ["Service map", "Integration risk report"],
        capacity: 58,
        focus: "Services, auth, Teams integration, Graph API permissions",
        initials: "BE",
        name: "Back End Lead",
        pings: 5,
        role: "Back End / Architecture",
        status: "Needs ping",
        tone: "warning",
      },
      {
        assets: ["Data pipeline diagram", "Retention questions"],
        capacity: 44,
        focus: "Transcript storage, data access, retention, source policy",
        initials: "DA",
        name: "Data Owner",
        pings: 3,
        role: "Data / Databases",
        status: "Blocked",
        tone: "error",
      },
    ],
    teamPings: 14,
    transcriptCoverage: 84,
    transcriptEvents: [
      {
        actor: "Project Sponsor",
        content: "We need the bot to join the Teams kickoff, gather technical context, then leave after the kickoff phase.",
        marker: "Scope",
        time: "15:08",
      },
      {
        actor: "Baymax",
        content: "Should the first dashboard view be role-based, so a UX/UI designer sees assigned design outputs first?",
        marker: "Question asked",
        time: "15:42",
      },
      {
        actor: "Gurney",
        content: "Yes, all the information sent to me should be first, including visuals, reports, and transcript highlights.",
        marker: "UX/UI",
        time: "15:45",
      },
      {
        actor: "Baymax",
        content: "What team capability profile should feasibility flags use: skills, tooling, capacity, or all three?",
        marker: "Question asked",
        time: "16:04",
      },
      {
        actor: "Back End Lead",
        content: "Teams integration needs a separate permissions and data-access decision before any pilot.",
        marker: "Risk",
        time: "16:18",
      },
    ],
  },
  {
    actionQueue: [
      { label: "Map order-tracking screens", meta: "Customer portal flow needs designer sequencing", tone: "brand" },
      { label: "Confirm checkout edge cases", meta: "Payment failure and reorder paths were mentioned", tone: "warning" },
      { label: "Review responsive table pattern", meta: "Operations team needs dense project data", tone: "info" },
    ],
    botState: "Summarizing",
    capabilityRows: [
      { capability: "Customer portal UX", coverage: "Covered", evidence: "Existing commerce patterns and flow templates", owner: "Gurney" },
      { capability: "Front-end build", coverage: "Covered", evidence: "Reusable table and dashboard components", owner: "Front End Lead" },
      { capability: "ERP integration", coverage: "Needs review", evidence: "Order status source has not been confirmed", owner: "Back End Lead" },
      { capability: "Customer data access", coverage: "Covered", evidence: "CRM source owner identified in kickoff", owner: "Data Owner" },
    ],
    categoryReviews: {
      ux: { evidence: "Portal map generated from customer and ops tasks", state: "Needs screen edits", tone: "brand" },
      frontend: { evidence: "React table density and mobile states called out", state: "Ready for owner review", tone: "success" },
      backend: { evidence: "ERP and CRM dependency split needs confirmation", state: "Needs review", tone: "warning" },
      data: { evidence: "CRM source owner confirmed", state: "Ready for approval", tone: "success" },
    },
    diagramNodes: {
      ui: ["Customer home", "Order details", "Issue report", "Agent handoff"],
      architecture: ["Portal app", "Auth layer", "CRM API", "ERP order source"],
      pipeline: ["CRM profile", "Order events", "Baymax summary", "Ops report"],
    },
    feasibility: "Green",
    id: "meridian",
    lastSynced: "Yesterday at 2:14 PM",
    name: "Project Meridian",
    openRisks: 1,
    ownerNote: "This is the cleaner pilot candidate: most UX and front-end assumptions are already understood.",
    questions: [
      {
        askedBy: "Baymax",
        assignee: "Gurney",
        category: "UX/UI",
        question: "Should the first flow prioritize customer self-serve order tracking or internal exception review?",
        status: "Answered",
        time: "10:18",
      },
      {
        askedBy: "Baymax",
        assignee: "Back End Lead",
        category: "Architecture",
        question: "Which system is the source of truth for order status: CRM, ERP, or fulfillment service?",
        status: "Pending",
        time: "10:27",
      },
      {
        askedBy: "Gurney",
        assignee: "Baymax",
        category: "UX/UI",
        question: "Generate a mobile version of the exception review flow for field teams.",
        status: "Team requested",
        time: "10:41",
      },
    ],
    reportAssets: [
      {
        assignee: "Gurney",
        category: "UX/UI",
        description: "Customer portal screen map covering order tracking, issue reporting, and agent handoff states.",
        evidence: "Transcript markers 10:18, 10:34, 10:41",
        icon: Paintbrush,
        status: "Needs screen edits",
        title: "Customer portal flow",
        tone: "brand",
      },
      {
        assignee: "Gurney",
        category: "Visual asset",
        description: "Mobile-first dashboard flow for operations staff reviewing order exceptions.",
        evidence: "Generated from team-requested question",
        icon: Workflow,
        status: "Draft",
        title: "Ops exception journey",
        tone: "info",
      },
      {
        assignee: "Front End Lead",
        category: "Front end",
        description: "Component and responsive-density notes for tables, filters, and order detail panels.",
        evidence: "Portal requirements capture",
        icon: MonitorDot,
        status: "Ready to approve",
        title: "Portal front-end packet",
        tone: "success",
      },
      {
        assignee: "Back End Lead",
        category: "Architecture",
        description: "ERP, CRM, and fulfillment dependency map with source-of-truth decision pending.",
        evidence: "Pending answer from 10:27",
        icon: GitBranch,
        status: "Needs source decision",
        title: "Order data integration map",
        tone: "warning",
      },
    ],
    shortName: "Meridian",
    status: "In discovery",
    subtitle: "Customer portal modernization",
    summary:
      "Baymax captured a customer portal kickoff and structured the first pass around self-serve order tracking, internal exception review, source-of-truth decisions, and mobile operations needs.",
    team: [
      {
        assets: ["Customer portal flow", "Ops exception journey"],
        capacity: 61,
        focus: "Customer flows, mobile states, accessibility for dense order tables",
        initials: "GK",
        name: "Gurney",
        pings: 3,
        role: "UX/UI Front End Designer",
        status: "Reviewing",
        tone: "brand",
      },
      {
        assets: ["Portal front-end packet", "Responsive table notes"],
        capacity: 70,
        focus: "Table patterns, filter states, responsive detail panels",
        initials: "FE",
        name: "Front End Lead",
        pings: 1,
        role: "Front End",
        status: "Clear",
        tone: "success",
      },
      {
        assets: ["Order data integration map"],
        capacity: 66,
        focus: "CRM, ERP, fulfillment source-of-truth mapping",
        initials: "BE",
        name: "Back End Lead",
        pings: 3,
        role: "Back End / Architecture",
        status: "Needs ping",
        tone: "warning",
      },
      {
        assets: ["Customer data access notes"],
        capacity: 52,
        focus: "CRM access, customer profile fields, export controls",
        initials: "DA",
        name: "Data Owner",
        pings: 1,
        role: "Data / Databases",
        status: "Clear",
        tone: "success",
      },
    ],
    teamPings: 8,
    transcriptCoverage: 71,
    transcriptEvents: [
      {
        actor: "Product Manager",
        content: "The portal needs order tracking first, but operations also needs a path to inspect exceptions.",
        marker: "Scope",
        time: "10:05",
      },
      {
        actor: "Baymax",
        content: "Should the first flow prioritize customer self-serve order tracking or internal exception review?",
        marker: "Question asked",
        time: "10:18",
      },
      {
        actor: "Operations Lead",
        content: "We need both, but the customer self-serve flow is the first demo.",
        marker: "Decision",
        time: "10:22",
      },
      {
        actor: "Baymax",
        content: "Which system is the source of truth for order status: CRM, ERP, or fulfillment service?",
        marker: "Question asked",
        time: "10:27",
      },
      {
        actor: "Gurney",
        content: "Please generate a mobile version of the exception review flow for field teams.",
        marker: "Team request",
        time: "10:41",
      },
    ],
  },
  {
    actionQueue: [
      { label: "Separate data ownership from UI scope", meta: "Stakeholders mixed dashboard and warehouse asks", tone: "warning" },
      { label: "Mark transcript storage as blocked", meta: "Policy and data retention owner missing", tone: "error" },
      { label: "Sketch leadership risk view", meta: "Need a clean way to show why delivery is paused", tone: "brand" },
    ],
    botState: "Paused",
    capabilityRows: [
      { capability: "Executive dashboard UX", coverage: "Covered", evidence: "Existing dashboard patterns can support the view", owner: "Gurney" },
      { capability: "Data platform ownership", coverage: "Blocked", evidence: "Warehouse owner not assigned", owner: "Data Owner" },
      { capability: "Integration architecture", coverage: "Needs review", evidence: "Graph, warehouse, and BI tooling overlap", owner: "Back End Lead" },
      { capability: "Governance workflow", coverage: "Blocked", evidence: "Approval policy is not defined", owner: "Delivery Lead" },
    ],
    categoryReviews: {
      ux: { evidence: "Leadership risk view and admin controls captured", state: "Sketch needed", tone: "brand" },
      frontend: { evidence: "Dashboard shell is feasible but data states are unclear", state: "Waiting on data states", tone: "warning" },
      backend: { evidence: "Architecture crosses Teams, warehouse, and BI tooling", state: "Needs review", tone: "warning" },
      data: { evidence: "No owner for retention, warehouse source, or access model", state: "Blocked", tone: "error" },
    },
    diagramNodes: {
      ui: ["Leadership overview", "Risk detail", "Data owner queue", "Approval gate"],
      architecture: ["Teams capture", "Governance service", "Warehouse", "BI workspace"],
      pipeline: ["Transcript intake", "PII review", "Warehouse load", "Executive report"],
    },
    feasibility: "Red",
    id: "atlas",
    lastSynced: "Monday at 9:50 AM",
    name: "Project Atlas",
    openRisks: 4,
    ownerNote: "Use this mock project to show blocked work: Baymax should help leadership see exactly what cannot move yet.",
    questions: [
      {
        askedBy: "Baymax",
        assignee: "Data Owner",
        category: "Data",
        question: "Who owns the warehouse table that stores meeting-derived project records?",
        status: "Pending",
        time: "09:16",
      },
      {
        askedBy: "Baymax",
        assignee: "Delivery Lead",
        category: "Feasibility",
        question: "Should this project be paused until governance and retention are approved?",
        status: "Asked live",
        time: "09:29",
      },
      {
        askedBy: "Back End Lead",
        assignee: "Baymax",
        category: "Architecture",
        question: "Ask leadership whether BI export is required for the first pilot.",
        status: "Team requested",
        time: "09:38",
      },
    ],
    reportAssets: [
      {
        assignee: "Gurney",
        category: "UX/UI",
        description: "Leadership dashboard concept focused on surfacing blocked governance and data ownership decisions.",
        evidence: "Transcript markers 09:16, 09:29, 09:45",
        icon: Paintbrush,
        status: "Sketch needed",
        title: "Executive risk view",
        tone: "brand",
      },
      {
        assignee: "Back End Lead",
        category: "Architecture",
        description: "Teams capture, governance service, warehouse, and BI export relationship map.",
        evidence: "Generated from architecture request",
        icon: GitBranch,
        status: "Needs review",
        title: "Governance architecture map",
        tone: "warning",
      },
      {
        assignee: "Data Owner",
        category: "Data",
        description: "Data pipeline draft showing transcript intake, PII review, retention policy, and warehouse loading.",
        evidence: "Blocked by unanswered ownership question",
        icon: Database,
        status: "Blocked",
        title: "Governance data pipeline",
        tone: "error",
      },
    ],
    shortName: "Atlas",
    status: "Blocked",
    subtitle: "Leadership reporting and data governance",
    summary:
      "Baymax captured an early leadership reporting kickoff, but the work is blocked by unclear data ownership, retention policy, governance approval, and BI export scope.",
    team: [
      {
        assets: ["Executive risk view"],
        capacity: 47,
        focus: "Blocked-state UX, leadership summary, approval flow",
        initials: "GK",
        name: "Gurney",
        pings: 2,
        role: "UX/UI Front End Designer",
        status: "Reviewing",
        tone: "brand",
      },
      {
        assets: ["Dashboard state matrix"],
        capacity: 49,
        focus: "Unavailable data states, warning panels, export affordances",
        initials: "FE",
        name: "Front End Lead",
        pings: 2,
        role: "Front End",
        status: "Needs ping",
        tone: "warning",
      },
      {
        assets: ["Governance architecture map"],
        capacity: 39,
        focus: "Governance service, BI export, Teams capture boundaries",
        initials: "BE",
        name: "Back End Lead",
        pings: 4,
        role: "Back End / Architecture",
        status: "Needs ping",
        tone: "warning",
      },
      {
        assets: ["Governance data pipeline", "Retention policy queue"],
        capacity: 28,
        focus: "Warehouse ownership, PII review, retention policy",
        initials: "DA",
        name: "Data Owner",
        pings: 4,
        role: "Data / Databases",
        status: "Blocked",
        tone: "error",
      },
    ],
    teamPings: 12,
    transcriptCoverage: 58,
    transcriptEvents: [
      {
        actor: "Leadership Sponsor",
        content: "We want a dashboard that makes delivery risk visible before the project goes too far.",
        marker: "Scope",
        time: "09:08",
      },
      {
        actor: "Baymax",
        content: "Who owns the warehouse table that stores meeting-derived project records?",
        marker: "Question asked",
        time: "09:16",
      },
      {
        actor: "Data Owner",
        content: "That ownership is not assigned yet, and retention policy still needs review.",
        marker: "Risk",
        time: "09:22",
      },
      {
        actor: "Baymax",
        content: "Should this project be paused until governance and retention are approved?",
        marker: "Question asked",
        time: "09:29",
      },
      {
        actor: "Back End Lead",
        content: "Ask leadership whether BI export is required for the first pilot.",
        marker: "Team request",
        time: "09:38",
      },
    ],
  },
];

export function App() {
  const [activeView, setActiveView] = useState<ViewId>("admin");
  const [activeProjectId, setActiveProjectId] = useState(projects[0].id);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("ux");
  const [activeDiagram, setActiveDiagram] = useState<DiagramId>("ui");
  const [projectDrafts, setProjectDrafts] = useState<Record<string, ProjectDraft>>({});
  const [editMode, setEditMode] = useState(false);
  const [selectedMeetingByProject, setSelectedMeetingByProject] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      projects.map((project) => [
        project.id,
        meetingSlots.find((meeting) => meeting.projectId === project.id && meeting.recommended)?.id ??
          meetingSlots.find((meeting) => meeting.projectId === project.id)?.id ??
          "",
      ]),
    ),
  );
  const [selectedTeamByProject, setSelectedTeamByProject] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(projects.map((project) => [project.id, project.team.map((member) => member.name)])),
  );

  const activeProject = useMemo(() => {
    const project = projects.find((item) => item.id === activeProjectId) ?? projects[0];
    return { ...project, ...projectDrafts[project.id] };
  }, [activeProjectId, projectDrafts]);

  const activeMeetings = useMemo(
    () => meetingSlots.filter((meeting) => meeting.projectId === activeProject.id),
    [activeProject.id],
  );
  const selectedMeetingId = selectedMeetingByProject[activeProject.id] ?? activeMeetings[0]?.id ?? "";
  const selectedTeam = selectedTeamByProject[activeProject.id] ?? activeProject.team.map((member) => member.name);
  const activeCategoryData = categories.find((category) => category.id === activeCategory) ?? categories[0];

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0 });
    setEditMode(false);
  }, [activeView, activeProjectId]);

  function selectProject(projectId: string, view: ViewId = activeView) {
    setActiveProjectId(projectId);
    setActiveView(view);
  }

  function updateProjectField<K extends keyof ProjectDraft>(field: K, value: ProjectDraft[K]) {
    setProjectDrafts((current) => ({
      ...current,
      [activeProject.id]: {
        ...current[activeProject.id],
        [field]: value,
      },
    }));
  }

  function resetProjectDraft() {
    setProjectDrafts((current) => {
      const next = { ...current };
      delete next[activeProject.id];
      return next;
    });
  }

  function selectMeeting(meetingId: string) {
    setSelectedMeetingByProject((current) => ({
      ...current,
      [activeProject.id]: meetingId,
    }));
  }

  function toggleTeamMember(memberName: string) {
    setSelectedTeamByProject((current) => {
      const selectedMembers = current[activeProject.id] ?? activeProject.team.map((member) => member.name);
      const nextMembers = selectedMembers.includes(memberName)
        ? selectedMembers.filter((name) => name !== memberName)
        : [...selectedMembers, memberName];

      return {
        ...current,
        [activeProject.id]: nextMembers,
      };
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col gap-4 p-3 lg:flex-row lg:p-4">
        <Sidebar
          activeProject={activeProject}
          activeView={activeView}
          onProjectChange={selectProject}
          onViewChange={setActiveView}
          projects={projects}
        />
        <div className="min-w-0 flex-1 space-y-4">
          <Topbar activeProject={activeProject} onProjectChange={(projectId) => selectProject(projectId)} projects={projects} />
          <main className="min-w-0">
            {activeView === "inbox" ? (
              <InboxView activeProject={activeProject} onProjectChange={selectProject} onViewChange={setActiveView} projects={projects} />
            ) : null}
            {activeView === "project" ? (
              <ProjectView
                activeCategory={activeCategory}
                activeCategoryData={activeCategoryData}
                activeDiagram={activeDiagram}
                editMode={editMode}
                onCategoryChange={setActiveCategory}
                onDiagramChange={setActiveDiagram}
                onEditModeChange={setEditMode}
                onFieldChange={updateProjectField}
                onProjectChange={selectProject}
                onResetProject={resetProjectDraft}
                project={activeProject}
                projects={projects}
              />
            ) : null}
            {activeView === "transcript" ? <TranscriptView project={activeProject} /> : null}
            {activeView === "team" ? <TeamView project={activeProject} /> : null}
            {activeView === "reports" ? <ReportsView project={activeProject} /> : null}
            {activeView === "admin" ? (
              <AdminView
                meetings={activeMeetings}
                onMeetingChange={selectMeeting}
                onProjectChange={selectProject}
                onTeamToggle={toggleTeamMember}
                onViewChange={setActiveView}
                project={activeProject}
                projects={projects}
                selectedMeetingId={selectedMeetingId}
                selectedTeam={selectedTeam}
              />
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  activeProject,
  activeView,
  onProjectChange,
  onViewChange,
  projects,
}: {
  activeProject: Project;
  activeView: ViewId;
  onProjectChange: (projectId: string, view?: ViewId) => void;
  onViewChange: (view: ViewId) => void;
  projects: Project[];
}) {
  return (
    <aside className="rounded-habibiLg border border-gray-200 bg-white p-3 shadow-habibiXs lg:min-h-[calc(100vh-2rem)] lg:w-[300px]">
      <div className="flex items-center gap-3 border-b border-gray-200 px-2 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-habibiMd bg-brand-700 text-white">
          <Bot aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">Baymax</p>
          <p className="truncate text-xs text-gray-500">Teams kickoff assistant</p>
        </div>
      </div>
      <nav aria-label="Baymax dashboard" className="mt-3 grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeView;

          return (
            <button
              className={[
                "focus-ring flex w-full items-center gap-3 rounded-habibiMd px-3 py-2.5 text-left transition-colors",
                active ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              ].join(" ")}
              key={item.id}
              onClick={() => onViewChange(item.id)}
              type="button"
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{item.label}</span>
                <span className="block truncate text-xs text-gray-500">{item.meta}</span>
              </span>
            </button>
          );
        })}
      </nav>
      <div className="mt-5 border-t border-gray-200 pt-4">
        <p className="px-2 text-xs font-semibold uppercase text-gray-500">Mock projects</p>
        <div className="mt-2 grid gap-2">
          {projects.map((project) => {
            const active = project.id === activeProject.id;
            const displayProject = active ? activeProject : project;

            return (
              <button
                className={[
                  "focus-ring rounded-habibiMd border p-3 text-left transition-colors",
                  active ? "border-brand-200 bg-brand-50" : "border-gray-200 bg-white hover:bg-gray-50",
                ].join(" ")}
                key={project.id}
                onClick={() => onProjectChange(project.id, "project")}
                type="button"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900">{displayProject.shortName}</span>
                  <Badge tone={feasibilityTone(displayProject.feasibility)}>{displayProject.feasibility}</Badge>
                </div>
                <p className="mt-1 truncate text-xs text-gray-500">{displayProject.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 rounded-habibiMd border border-warning-200 bg-warning-50 p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle aria-hidden="true" className="h-4 w-4 text-warning-700" />
          <p className="text-sm font-semibold text-warning-700">Feasibility watch</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-warning-700">
          Switch projects to compare how Baymax explains green, yellow, and red readiness states.
        </p>
      </div>
    </aside>
  );
}

function Topbar({
  activeProject,
  onProjectChange,
  projects,
}: {
  activeProject: Project;
  onProjectChange: (projectId: string) => void;
  projects: Project[];
}) {
  return (
    <header className="flex flex-col gap-3 rounded-habibiLg border border-gray-200 bg-white px-4 py-3 shadow-habibiXs xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">{activeProject.name} kickoff</p>
        <p className="truncate text-xs text-gray-500">Microsoft Teams capture - last synced {activeProject.lastSynced}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <label className="focus-within:shadow-[var(--habibi-focus-ring)] flex h-10 min-w-0 items-center gap-2 rounded-habibiMd border border-gray-300 bg-white px-3 text-sm text-gray-500 sm:w-[280px]">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
            placeholder="Search transcript, reports, team"
            type="search"
          />
        </label>
        <label className="sr-only" htmlFor="project-switcher">Switch project</label>
        <select
          className="focus-ring h-10 rounded-habibiMd border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-habibiXs"
          id="project-switcher"
          onChange={(event) => onProjectChange(event.target.value)}
          value={activeProject.id}
        >
          {projects.map((project) => {
            const displayProject = project.id === activeProject.id ? activeProject : project;

            return (
              <option key={project.id} value={project.id}>
                {displayProject.name}
              </option>
            );
          })}
        </select>
        <div className="flex items-center gap-2">
          <IconButton icon={HelpCircle} label="Help" />
          <IconButton icon={Bell} label="Notifications" />
          <Avatar initials="GK" label="Gurney profile" status="online" />
        </div>
      </div>
    </header>
  );
}

function InboxView({
  activeProject,
  onProjectChange,
  onViewChange,
  projects,
}: {
  activeProject: Project;
  onProjectChange: (projectId: string, view?: ViewId) => void;
  onViewChange: (view: ViewId) => void;
  projects: Project[];
}) {
  const designerAssets = activeProject.reportAssets.filter((asset) => asset.assignee === "Gurney");
  const designerPings = activeProject.team.find((member) => member.name === "Gurney")?.pings ?? 0;

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <>
            <Button icon={MessageSquareText} onClick={() => onViewChange("transcript")} variant="secondary">
              Open transcript
            </Button>
            <Button icon={PanelRightOpen} onClick={() => onViewChange("project")}>
              Edit project
            </Button>
          </>
        }
        eyebrow="Designer review workspace"
        status={<StatusPill icon={Sparkles} tone="brand">{designerAssets.length + designerPings} items routed to you</StatusPill>}
        title="Designer review queue"
      >
        Baymax creates first-pass mockups, flow maps, and design notes from the kickoff so one designer can review the
        strongest draft instead of every early project needing multiple designers in discovery.
      </PageHeader>

      <DesignerApprovalFlowPanel project={activeProject} onViewChange={onViewChange} />

      <ProjectQueue activeProject={activeProject} onProjectChange={onProjectChange} projects={projects} />

      <MetricStrip
        metrics={[
          { delta: `${designerAssets.length} assigned`, icon: Paintbrush, label: "Visual assets", tone: "brand", value: String(activeProject.reportAssets.length) },
          { delta: `${activeProject.questions.length} Baymax markers`, icon: MessageSquareText, label: "Transcript coverage", tone: "info", value: `${activeProject.transcriptCoverage}%` },
          { delta: `${designerPings} pings to you`, icon: ClipboardCheck, label: "Approval steps", tone: "warning", value: String(activeProject.teamPings) },
          { delta: activeProject.status, icon: Gauge, label: "Feasibility", tone: feasibilityTone(activeProject.feasibility), value: activeProject.feasibility },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="space-y-4">
          <SectionHeading
            description={`Baymax groups your ${activeProject.shortName} handoff before the wider team queue.`}
            title="Sent to Gurney"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {designerAssets.map((asset) => (
              <AssetCard asset={asset} key={asset.title} />
            ))}
          </div>
          <Panel title="Transcript highlights" actions={<Button icon={Eye} onClick={() => onViewChange("transcript")} variant="secondary">Review markers</Button>}>
            <div className="space-y-3">
              {activeProject.transcriptEvents.slice(1, 4).map((event) => (
                <TranscriptRow event={event} key={event.time} />
              ))}
            </div>
          </Panel>
        </section>

        <aside className="space-y-4">
          <Panel title="Designer action queue" description="Assigned from kickoff output and Teams chat updates.">
            <div className="space-y-3">
              {activeProject.actionQueue.map((item) => (
                <ActionRow item={item} key={item.label} />
              ))}
            </div>
          </Panel>
          <Panel title="Project snapshot">
            <ProjectSummaryCompact project={activeProject} />
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function DesignerApprovalFlowPanel({
  onViewChange,
  project,
}: {
  onViewChange: (view: ViewId) => void;
  project: Project;
}) {
  const designerAssets = project.reportAssets.filter((asset) => asset.assignee === "Gurney");
  const flow: FlowStage[] = [
    {
      detail: "Baymax converts kickoff context into draft screens, flow maps, and design questions.",
      owner: "Baymax",
      title: "Mockups generated",
      tone: "brand",
    },
    {
      detail: "Designer reviews the drafts, edits weak assumptions, and requests regeneration where needed.",
      owner: "Designer",
      title: "Review and edit",
      tone: "warning",
    },
    {
      detail: "Approved design assets join front-end, architecture, and data notes in the review packet.",
      owner: "Project team",
      title: "Packet approved",
      tone: "success",
    },
    {
      detail: "Admin or PM sends the approved packet back to the business for a go or no-go decision.",
      owner: "PM / Admin",
      title: "Return to business",
      tone: "info",
    },
  ];

  return (
    <Panel
      actions={
        <>
          <Button icon={FileText} onClick={() => onViewChange("reports")} variant="secondary">
            Open review packet
          </Button>
          <Button icon={CheckCircle2}>Approve mockups</Button>
        </>
      }
      description={`${designerAssets.length} Baymax-generated assets are assigned to the UX/UI reviewer for ${project.shortName}.`}
      title="Mockup approval flow"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {flow.map((stage, index) => (
          <article className="rounded-habibiMd border border-gray-200 bg-gray-50 p-4" key={stage.title}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase text-gray-500">Step {index + 1}</span>
              <StatusDot tone={stage.tone} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-gray-900">{stage.title}</h3>
            <p className="mt-1 text-xs font-medium text-gray-500">{stage.owner}</p>
            <p className="mt-3 text-sm leading-5 text-gray-600">{stage.detail}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function ProjectView({
  activeCategory,
  activeCategoryData,
  activeDiagram,
  editMode,
  onCategoryChange,
  onDiagramChange,
  onEditModeChange,
  onFieldChange,
  onProjectChange,
  onResetProject,
  project,
  projects,
}: {
  activeCategory: CategoryId;
  activeCategoryData: (typeof categories)[number];
  activeDiagram: DiagramId;
  editMode: boolean;
  onCategoryChange: (category: CategoryId) => void;
  onDiagramChange: (diagram: DiagramId) => void;
  onEditModeChange: (value: boolean) => void;
  onFieldChange: <K extends keyof ProjectDraft>(field: K, value: ProjectDraft[K]) => void;
  onProjectChange: (projectId: string, view?: ViewId) => void;
  onResetProject: () => void;
  project: Project;
  projects: Project[];
}) {
  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <>
            <Button icon={RefreshCw} variant="secondary">Regenerate visuals</Button>
            <Button icon={Send}>Ask next question</Button>
          </>
        }
        eyebrow="Project dashboard"
        status={<StatusPill icon={Clock3} tone={statusTone(project.status)}>{project.status}</StatusPill>}
        title={project.name}
      >
        Structured kickoff output from Teams: project summary, technical categories, generated diagrams, questions,
        feasibility flags, and team review status. Use the project cards and edit panel to move through mock projects.
      </PageHeader>

      <ProjectQueue activeProject={project} onProjectChange={onProjectChange} projects={projects} />

      <MetricStrip
        metrics={[
          { delta: "Teams connected", icon: Bot, label: "Bot state", tone: project.botState === "Paused" ? "warning" : "success", value: project.botState },
          { delta: `${project.questions.length} questions logged`, icon: MessageSquareText, label: "Transcript coverage", tone: "info", value: `${project.transcriptCoverage}%` },
          { delta: project.feasibility === "Red" ? "Governance and data" : "Data and capacity", icon: AlertTriangle, label: "Open risks", tone: project.openRisks > 2 ? "error" : "warning", value: String(project.openRisks) },
          { delta: `${project.team.length} reviewers`, icon: Users, label: "Team pings", tone: "brand", value: String(project.teamPings) },
        ]}
      />

      <ProjectEditPanel
        editMode={editMode}
        onEditModeChange={onEditModeChange}
        onFieldChange={onFieldChange}
        onReset={onResetProject}
        project={project}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-4">
          <ProjectSummaryPanel project={project} />
          <TechnicalBreakdown
            activeCategory={activeCategory}
            activeCategoryData={activeCategoryData}
            onCategoryChange={onCategoryChange}
            project={project}
          />
          <DiagramPanel activeDiagram={activeDiagram} onDiagramChange={onDiagramChange} project={project} />
          <QuestionsLog project={project} />
        </section>
        <aside className="space-y-4">
          <LiveMonitorPanel project={project} />
          <FlagsPanel project={project} />
        </aside>
      </div>
    </div>
  );
}

function TranscriptView({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <>
            <Button icon={Download} variant="secondary">Export transcript</Button>
            <Button icon={Plus}>Add follow-up</Button>
          </>
        }
        eyebrow="Calls and Teams chat"
        status={<StatusPill icon={MessageSquareText} tone="info">{project.questions.length} question markers</StatusPill>}
        title={`${project.name} transcript review`}
      >
        Call and chat evidence with Baymax questions pinned to the exact moments they were asked or requested.
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Panel title="Kickoff transcript" description="Teams call transcript with Baymax question markers.">
          <div className="space-y-3">
            {project.transcriptEvents.map((event) => (
              <TranscriptRow event={event} key={event.time} />
            ))}
          </div>
        </Panel>
        <Panel title="Question trace" description="Questions asked live, pending, or queued by the team.">
          <div className="space-y-3">
            {project.questions.map((question) => (
              <QuestionTraceCard question={question} key={`${question.time}-${question.question}`} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function TeamView({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <>
            <Button icon={Archive} variant="secondary">Update profile</Button>
            <Button icon={Bell}>Send pings</Button>
          </>
        }
        eyebrow="Team capability profile"
        status={<StatusPill icon={Gauge} tone={feasibilityTone(project.feasibility)}>Feasibility {project.feasibility}</StatusPill>}
        title={`People attached to ${project.name}`}
      >
        Team members, skills, capacity, Baymax pings, and assigned outputs used to keep feasibility flags grounded.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        {project.team.map((member) => (
          <TeamMemberCard member={member} key={member.name} />
        ))}
      </div>
      <CapabilityMatrix project={project} />
    </div>
  );
}

function ReportsView({ project }: { project: Project }) {
  const groupedAssets = useMemo(
    () =>
      project.team.map((member) => ({
        member,
        assets: project.reportAssets.filter((asset) => asset.assignee === member.name),
      })),
    [project],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <>
            <Button icon={RefreshCw} variant="secondary">Regenerate selected</Button>
            <Button icon={FileText}>Generate report</Button>
          </>
        }
        eyebrow="Reports and visual assets"
        status={<StatusPill icon={CheckCircle2} tone="success">{project.reportAssets.length} generated outputs</StatusPill>}
        title={`${project.name} generated outputs`}
      >
        Reports, diagrams, and generated visual assets are grouped by the team member who needs to review or approve them.
      </PageHeader>

      <div className="space-y-4">
        {groupedAssets.map(({ assets, member }) => (
          <Panel actions={<Badge tone={member.tone}>{member.status}</Badge>} key={member.name} title={`${member.name} - ${member.role}`}>
            {assets.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {assets.map((asset) => (
                  <AssetCard asset={asset} key={asset.title} />
                ))}
              </div>
            ) : (
              <div className="rounded-habibiMd border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-500">
                No generated assets are assigned to this reviewer yet.
              </div>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}

function AdminView({
  meetings,
  onMeetingChange,
  onProjectChange,
  onTeamToggle,
  onViewChange,
  project,
  projects,
  selectedMeetingId,
  selectedTeam,
}: {
  meetings: MeetingSlot[];
  onMeetingChange: (meetingId: string) => void;
  onProjectChange: (projectId: string, view?: ViewId) => void;
  onTeamToggle: (memberName: string) => void;
  onViewChange: (view: ViewId) => void;
  project: Project;
  projects: Project[];
  selectedMeetingId: string;
  selectedTeam: string[];
}) {
  const selectedMeeting = meetings.find((meeting) => meeting.id === selectedMeetingId) ?? meetings[0];
  const clearReviewers = project.team.filter((member) => member.status === "Clear").length;
  const selectedReviewerCount = selectedTeam.length;

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <>
            <Button icon={PanelRightOpen} onClick={() => onViewChange("inbox")} variant="secondary">
              Open designer review
            </Button>
            <Button icon={Send}>Send Baymax</Button>
          </>
        }
        eyebrow="Admin command center"
        status={<StatusPill icon={Bot} tone={selectedMeeting?.tone ?? "neutral"}>{selectedMeeting?.botAccess ?? "No Teams meeting"}</StatusPill>}
        title="Baymax project intake"
      >
        Control where Baymax goes, who can see the project, and which generated wireframes, diagrams, and notes get
        reviewed before the real team joins. The goal is to remove redundant early design staffing by giving reviewers a
        fast first draft to approve, edit, or send back to the business.
      </PageHeader>

      <MetricStrip
        metrics={[
          { delta: selectedMeeting?.time ?? "Pick a Teams call", icon: Bot, label: "Meeting connector", tone: selectedMeeting?.tone ?? "neutral", value: selectedMeeting?.botAccess ?? "None" },
          { delta: "Project team visibility", icon: Users, label: "Reviewers selected", tone: "brand", value: `${selectedReviewerCount}/${project.team.length}` },
          { delta: "Wireframes and diagrams", icon: Workflow, label: "Draft outputs", tone: "info", value: String(project.reportAssets.length) },
          { delta: project.status, icon: CheckCircle2, label: "Business decision gate", tone: feasibilityTone(project.feasibility), value: project.feasibility },
        ]}
      />

      <OperatingFlowPanel />

      <ProjectQueue activeProject={project} onProjectChange={onProjectChange} projects={projects} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-4">
          <TeamsConnectorPanel
            meetings={meetings}
            onMeetingChange={onMeetingChange}
            project={project}
            selectedMeeting={selectedMeeting}
            selectedMeetingId={selectedMeetingId}
          />
          <TeamVisibilityPanel onTeamToggle={onTeamToggle} project={project} selectedTeam={selectedTeam} />
          <AdminGeneratedPacketPanel project={project} />
        </section>
        <aside className="space-y-4">
          <RedundancyPanel project={project} />
          <BusinessHandoffPanel clearReviewers={clearReviewers} project={project} selectedMeeting={selectedMeeting} selectedTeam={selectedTeam} />
        </aside>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsPanel
          icon={Bot}
          items={[
            ["Kickoff-only meeting mode", "Enabled"],
            ["Live Teams chat monitoring", project.botState === "Paused" ? "Paused for governance" : "Enabled for project channel"],
            ["Real-time question guardrails", "Human approved templates"],
          ]}
          title="Bot behavior"
        />
        <SettingsPanel
          icon={ShieldCheck}
          items={[
            ["Teams meeting access", project.feasibility === "Red" ? "Awaiting leadership approval" : "Enabled"],
            ["Transcript storage", "Project workspace only"],
            ["Generated report access", "Reviewer and admin roles"],
          ]}
          title="Access and data"
        />
        <SettingsPanel
          icon={Gauge}
          items={[
            ["Skills profile freshness", project.feasibility === "Green" ? "Current" : "Needs owner review"],
            ["Capacity profile owner", "Delivery operations"],
            ["Risk flag confidence", project.feasibility === "Red" ? "Low until blockers clear" : "Medium"],
          ]}
          title="Feasibility model"
        />
        <SettingsPanel
          icon={ClipboardCheck}
          items={[
            ["UX/UI question pack", "Active"],
            ["Architecture question pack", project.openRisks > 2 ? "Needs leadership review" : "Active"],
            ["Data retention question pack", project.feasibility === "Red" ? "Blocked" : "Draft"],
          ]}
          title="Question templates"
        />
      </div>
    </div>
  );
}

function OperatingFlowPanel() {
  return (
    <Panel title="Baymax operating flow" description="The admin-level path from first business contact to project approval.">
      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {operatingFlow.map((stage, index) => (
          <li className="rounded-habibiMd border border-gray-200 bg-gray-50 p-4" key={stage.title}>
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-700 shadow-habibiXs">
                {index + 1}
              </span>
              <StatusDot tone={stage.tone} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">{stage.title}</h3>
            <p className="mt-1 text-xs font-medium text-gray-500">{stage.owner}</p>
            <p className="mt-3 text-sm leading-5 text-gray-600">{stage.detail}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function TeamsConnectorPanel({
  meetings,
  onMeetingChange,
  project,
  selectedMeeting,
  selectedMeetingId,
}: {
  meetings: MeetingSlot[];
  onMeetingChange: (meetingId: string) => void;
  project: Project;
  selectedMeeting?: MeetingSlot;
  selectedMeetingId: string;
}) {
  return (
    <Panel
      actions={<Button icon={Send}>Send bot to selected meeting</Button>}
      description="Choose the Teams meeting Baymax should attend for kickoff discovery."
      title="Teams meeting connector"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {meetings.map((meeting) => (
          <MeetingCard
            active={meeting.id === selectedMeetingId}
            key={meeting.id}
            meeting={meeting}
            onSelect={() => onMeetingChange(meeting.id)}
          />
        ))}
      </div>
      {selectedMeeting ? (
        <div className="mt-4 grid gap-3 rounded-habibiMd border border-brand-200 bg-brand-50 p-4 md:grid-cols-3">
          <InlineMetric label="Selected business" value={selectedMeeting.business} />
          <InlineMetric label="Meeting host" value={selectedMeeting.host} />
          <InlineMetric label="Baymax mode" value={project.botState} />
        </div>
      ) : null}
    </Panel>
  );
}

function MeetingCard({
  active,
  meeting,
  onSelect,
}: {
  active: boolean;
  meeting: MeetingSlot;
  onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={[
        "focus-ring rounded-habibiLg border bg-white p-4 text-left shadow-habibiXs transition-colors",
        active ? "border-brand-300 ring-2 ring-brand-100" : "border-gray-200 hover:bg-gray-50",
      ].join(" ")}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{meeting.title}</p>
          <p className="mt-1 text-xs text-gray-500">{meeting.business}</p>
        </div>
        <Badge tone={meeting.tone}>{meeting.botAccess}</Badge>
      </div>
      <p className="mt-3 text-sm leading-5 text-gray-600">{meeting.agenda}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <MiniStat label="time" value={meeting.time} />
        <MiniStat label="people" value={String(meeting.attendees)} />
        <MiniStat label="host" value={meeting.host} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone={meeting.tone}>{meeting.status}</Badge>
        {meeting.recommended ? <Badge tone="brand">Recommended</Badge> : null}
      </div>
    </button>
  );
}

function TeamVisibilityPanel({
  onTeamToggle,
  project,
  selectedTeam,
}: {
  onTeamToggle: (memberName: string) => void;
  project: Project;
  selectedTeam: string[];
}) {
  return (
    <Panel
      actions={<Button icon={Users} variant="secondary">Add reviewer</Button>}
      description="Pick who can see the project workspace, transcript markers, generated drafts, and Baymax pings."
      title="Project team visibility"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {project.team.map((member) => {
          const selected = selectedTeam.includes(member.name);

          return (
            <label
              className={[
                "flex cursor-pointer gap-3 rounded-habibiLg border p-4 transition-colors",
                selected ? "border-brand-200 bg-brand-50" : "border-gray-200 bg-white hover:bg-gray-50",
              ].join(" ")}
              key={member.name}
            >
              <input
                checked={selected}
                className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#6941c6]"
                onChange={() => onTeamToggle(member.name)}
                type="checkbox"
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900">{member.name}</span>
                  <Badge tone={member.tone}>{member.status}</Badge>
                </span>
                <span className="mt-1 block text-sm text-gray-500">{member.role}</span>
                <span className="mt-3 block text-sm leading-5 text-gray-600">{member.focus}</span>
              </span>
            </label>
          );
        })}
      </div>
    </Panel>
  );
}

function AdminGeneratedPacketPanel({ project }: { project: Project }) {
  return (
    <Panel
      actions={
        <>
          <Button icon={RefreshCw} variant="secondary">Regenerate drafts</Button>
          <Button icon={CheckCircle2}>Approve packet</Button>
        </>
      }
      description="The draft package Baymax creates before design, front end, back end, and data owners spend project time."
      title="Generated draft packet"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {project.reportAssets.map((asset) => {
          const Icon = asset.icon;

          return (
            <article className="rounded-habibiLg border border-gray-200 bg-white p-4 shadow-habibiXs" key={asset.title}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className={["rounded-habibiMd p-2.5", iconBg(asset.tone)].join(" ")}>
                    <Icon aria-hidden="true" className={["h-4 w-4", iconTone(asset.tone)].join(" ")} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{asset.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{asset.category} - {asset.assignee}</p>
                  </div>
                </div>
                <Badge tone={asset.tone}>{asset.status}</Badge>
              </div>
              <p className="mt-3 text-sm leading-5 text-gray-600">{asset.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button icon={Eye} size="sm" variant="secondary">Review</Button>
                <Button icon={Edit3} size="sm" variant="ghost">Edit</Button>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

function RedundancyPanel({ project }: { project: Project }) {
  const designerAssets = project.reportAssets.filter((asset) => asset.assignee === "Gurney").length;

  return (
    <Panel title="Problem Baymax solves" description="Reduce the number of designers pulled into early discovery before the project is approved.">
      <div className="grid gap-3">
        <div className="rounded-habibiMd border border-error-100 bg-error-50 p-4">
          <p className="text-sm font-semibold text-error-700">Before Baymax</p>
          <p className="mt-2 text-sm leading-6 text-error-700">
            PMs ask multiple designers to sit in early calls, repeat discovery questions, and produce speculative
            sketches before the business confirms the work is worth staffing.
          </p>
        </div>
        <div className="rounded-habibiMd border border-success-100 bg-success-50 p-4">
          <p className="text-sm font-semibold text-success-700">With Baymax</p>
          <p className="mt-2 text-sm leading-6 text-success-700">
            Baymax attends the selected kickoff, creates {designerAssets} designer-ready mockup assets for {project.shortName},
            routes them for approval, and gives the team a clearer go or no-go packet.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function BusinessHandoffPanel({
  clearReviewers,
  project,
  selectedMeeting,
  selectedTeam,
}: {
  clearReviewers: number;
  project: Project;
  selectedMeeting?: MeetingSlot;
  selectedTeam: string[];
}) {
  const teamReady = clearReviewers >= Math.max(1, Math.ceil(selectedTeam.length / 2));
  const businessTone = project.feasibility === "Red" ? "error" : teamReady ? "success" : "warning";

  return (
    <Panel
      actions={<Button icon={Send} variant={project.feasibility === "Red" ? "secondary" : "primary"}>Send to business</Button>}
      description="Review state before the PM sends Baymax output back to the business."
      title="Business handoff gate"
    >
      <div className="space-y-3">
        <HandoffRow
          label="Teams kickoff"
          meta={selectedMeeting ? `${selectedMeeting.title} - ${selectedMeeting.time}` : "No meeting selected"}
          tone={selectedMeeting?.botAccess === "Ready" ? "success" : "warning"}
          value={selectedMeeting?.botAccess ?? "Not selected"}
        />
        <HandoffRow
          label="Team review"
          meta={`${selectedTeam.length} reviewers can see transcript markers and draft outputs`}
          tone={teamReady ? "success" : "warning"}
          value={`${clearReviewers}/${selectedTeam.length || project.team.length} clear`}
        />
        <HandoffRow
          label="Generated packet"
          meta="Wireframes, architecture map, data pipeline, notes, and open questions"
          tone={project.reportAssets.length > 3 ? "success" : "info"}
          value={`${project.reportAssets.length} assets`}
        />
        <HandoffRow
          label="Project decision"
          meta={project.ownerNote}
          tone={businessTone}
          value={project.feasibility}
        />
      </div>
    </Panel>
  );
}

function HandoffRow({
  label,
  meta,
  tone,
  value,
}: {
  label: string;
  meta: string;
  tone: Tone;
  value: string;
}) {
  return (
    <div className="rounded-habibiMd border border-gray-200 bg-gray-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <Badge tone={tone}>{value}</Badge>
      </div>
      <p className="mt-2 text-sm leading-5 text-gray-600">{meta}</p>
    </div>
  );
}

function ProjectQueue({
  activeProject,
  onProjectChange,
  projects,
}: {
  activeProject: Project;
  onProjectChange: (projectId: string, view?: ViewId) => void;
  projects: Project[];
}) {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {projects.map((project) => {
        const active = project.id === activeProject.id;
        const displayProject = active ? activeProject : project;

        return (
          <button
            className={[
              "focus-ring rounded-habibiLg border bg-white p-4 text-left shadow-habibiXs transition-colors",
              active ? "border-brand-300 ring-2 ring-brand-100" : "border-gray-200 hover:bg-gray-50",
            ].join(" ")}
            key={project.id}
            onClick={() => onProjectChange(project.id, "project")}
            type="button"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-900">{displayProject.name}</span>
              <Badge tone={feasibilityTone(displayProject.feasibility)}>{displayProject.feasibility}</Badge>
            </div>
            <p className="mt-1 text-xs text-gray-500">{displayProject.subtitle}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <MiniStat label="Risks" value={String(displayProject.openRisks)} />
              <MiniStat label="Questions" value={String(displayProject.questions.length)} />
              <MiniStat label="Assets" value={String(displayProject.reportAssets.length)} />
            </div>
          </button>
        );
      })}
    </section>
  );
}

function ProjectEditPanel({
  editMode,
  onEditModeChange,
  onFieldChange,
  onReset,
  project,
}: {
  editMode: boolean;
  onEditModeChange: (value: boolean) => void;
  onFieldChange: <K extends keyof ProjectDraft>(field: K, value: ProjectDraft[K]) => void;
  onReset: () => void;
  project: Project;
}) {
  return (
    <Panel
      actions={
        <>
          <Button icon={RotateCcw} onClick={onReset} variant="ghost">Reset mock edits</Button>
          <Button icon={editMode ? Save : Edit3} onClick={() => onEditModeChange(!editMode)} variant={editMode ? "primary" : "secondary"}>
            {editMode ? "Done editing" : "Edit details"}
          </Button>
        </>
      }
      description="A lightweight edit area to show how project owners could revise Baymax output before approval."
      title="Project editing workspace"
    >
      {editMode ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Project name">
            <input
              className="field-control"
              onChange={(event) => onFieldChange("name", event.target.value)}
              value={project.name}
            />
          </Field>
          <Field label="Last synced label">
            <input
              className="field-control"
              onChange={(event) => onFieldChange("lastSynced", event.target.value)}
              value={project.lastSynced}
            />
          </Field>
          <Field label="Project status">
            <select
              className="field-control"
              onChange={(event) => onFieldChange("status", event.target.value as ProjectStatus)}
              value={project.status}
            >
              <option>Kickoff review</option>
              <option>In discovery</option>
              <option>Blocked</option>
              <option>Ready for approval</option>
            </select>
          </Field>
          <Field label="Feasibility">
            <select
              className="field-control"
              onChange={(event) => onFieldChange("feasibility", event.target.value as Feasibility)}
              value={project.feasibility}
            >
              <option>Green</option>
              <option>Yellow</option>
              <option>Red</option>
            </select>
          </Field>
          <Field label="Project summary" wide>
            <textarea
              className="field-control min-h-28 resize-y"
              onChange={(event) => onFieldChange("summary", event.target.value)}
              value={project.summary}
            />
          </Field>
          <Field label="Owner note" wide>
            <textarea
              className="field-control min-h-24 resize-y"
              onChange={(event) => onFieldChange("ownerNote", event.target.value)}
              value={project.ownerNote}
            />
          </Field>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={statusTone(project.status)}>{project.status}</Badge>
              <Badge tone={feasibilityTone(project.feasibility)}>Feasibility {project.feasibility}</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-600">{project.summary}</p>
            <p className="mt-3 rounded-habibiMd bg-gray-50 px-3 py-2 text-sm leading-6 text-gray-600">{project.ownerNote}</p>
          </div>
          <div className="rounded-habibiMd border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">Edit preview</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Use Edit details to try changing the project name, status, feasibility, summary, or owner note. The edits stay in this browser session and update the surrounding dashboard immediately.
            </p>
          </div>
        </div>
      )}
    </Panel>
  );
}

function ProjectSummaryPanel({ project }: { project: Project }) {
  return (
    <Panel title="Project summary" description="Status, feasibility, last update, project scope, and review state.">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={feasibilityTone(project.feasibility)}>Feasibility {project.feasibility}</Badge>
            <Badge tone={project.botState === "Paused" ? "warning" : "success"}>{project.botState}</Badge>
            <Badge tone={statusTone(project.status)}>{project.status}</Badge>
          </div>
          <p className="mt-4 text-sm leading-6 text-gray-600">{project.summary}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InlineMetric label="Last update" value={project.lastSynced} />
            <InlineMetric label="Reviewers" value={`${project.team.length} active`} />
            <InlineMetric label="Open risks" value={String(project.openRisks)} />
          </div>
        </div>
        <div className="rounded-habibiMd border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">Attached team</p>
          <div className="mt-4 flex -space-x-2">
            {project.team.map((member) => (
              <Avatar initials={member.initials} key={member.name} label={member.name} status={member.status === "Blocked" ? "away" : "online"} />
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <Progress label="Transcript reviewed" value={project.transcriptCoverage} />
            <Progress label="Capability profile" value={Math.max(22, 100 - project.openRisks * 18)} tone={feasibilityTone(project.feasibility)} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function TechnicalBreakdown({
  activeCategory,
  activeCategoryData,
  onCategoryChange,
  project,
}: {
  activeCategory: CategoryId;
  activeCategoryData: (typeof categories)[number];
  onCategoryChange: (category: CategoryId) => void;
  project: Project;
}) {
  const review = project.categoryReviews[activeCategory];

  return (
    <Panel title="Technical breakdown" description="Fixed intake framework from the project proposal.">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            aria-pressed={activeCategory === category.id}
            className={[
              "focus-ring rounded-habibiMd px-3 py-2 text-sm font-semibold",
              activeCategory === category.id ? "bg-brand-50 text-brand-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            ].join(" ")}
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <InfoBlock label="Baymax listens for" value={activeCategoryData.listensFor} />
        <InfoBlock label="Dashboard output" value={activeCategoryData.output} />
        <InfoBlock label="Review state" value={review.state} />
      </div>
      <div className="mt-5 rounded-habibiMd border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <StatusDot tone={review.tone} />
          <p className="text-sm font-semibold text-gray-900">{activeCategoryData.label} evidence</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-600">{review.evidence}</p>
      </div>
    </Panel>
  );
}

function DiagramPanel({
  activeDiagram,
  onDiagramChange,
  project,
}: {
  activeDiagram: DiagramId;
  onDiagramChange: (diagram: DiagramId) => void;
  project: Project;
}) {
  const diagrams: Array<{ id: DiagramId; label: string }> = [
    { id: "ui", label: "UI diagram" },
    { id: "architecture", label: "Architecture" },
    { id: "pipeline", label: "Data pipeline" },
  ];

  return (
    <Panel
      actions={<Button icon={RefreshCw} variant="secondary">Regenerate</Button>}
      title="Auto-generated visuals"
      description="Editable diagrams generated from kickoff context."
    >
      <div className="flex flex-wrap gap-2">
        {diagrams.map((diagram) => (
          <button
            aria-pressed={activeDiagram === diagram.id}
            className={[
              "focus-ring rounded-habibiMd px-3 py-2 text-sm font-semibold",
              activeDiagram === diagram.id ? "bg-brand-50 text-brand-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            ].join(" ")}
            key={diagram.id}
            onClick={() => onDiagramChange(diagram.id)}
            type="button"
          >
            {diagram.label}
          </button>
        ))}
      </div>
      <DiagramCanvas nodes={project.diagramNodes[activeDiagram]} />
    </Panel>
  );
}

function DiagramCanvas({ nodes }: { nodes: string[] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-habibiMd border border-gray-200 bg-gray-50 p-5">
      <div className="grid gap-3 md:grid-cols-4">
        {nodes.map((node, index) => (
          <div className="flex items-center gap-3" key={node}>
            <div className="min-h-24 flex-1 rounded-habibiMd border border-gray-300 bg-white p-3 shadow-habibiXs">
              <p className="text-xs font-semibold uppercase text-gray-500">Step {index + 1}</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{node}</p>
              <div className="mt-4 h-2 w-3/4 rounded-full bg-gray-200" />
              <div className="mt-2 h-2 w-1/2 rounded-full bg-gray-200" />
            </div>
            {index < nodes.length - 1 ? <ChevronRight aria-hidden="true" className="hidden h-5 w-5 text-gray-400 md:block" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionsLog({ project }: { project: Project }) {
  return (
    <Panel title="Questions log" description="Asked, pending, and team-requested questions with transcript anchors.">
      <div className="overflow-x-auto rounded-habibiMd border border-gray-200">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3" scope="col">Time</th>
              <th className="px-4 py-3" scope="col">Question</th>
              <th className="px-4 py-3" scope="col">Category</th>
              <th className="px-4 py-3" scope="col">Owner</th>
              <th className="px-4 py-3" scope="col">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {project.questions.map((question) => (
              <tr className="hover:bg-gray-50" key={`${question.time}-${question.question}`}>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{question.time}</td>
                <td className="px-4 py-3 text-gray-700">{question.question}</td>
                <td className="px-4 py-3 text-gray-600">{question.category}</td>
                <td className="px-4 py-3 text-gray-600">{question.assignee}</td>
                <td className="px-4 py-3"><Badge tone={question.status === "Pending" ? "warning" : "success"}>{question.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function LiveMonitorPanel({ project }: { project: Project }) {
  return (
    <Panel title="Chat and meeting monitor" description="Recent Teams activity Baymax is tracking for this kickoff.">
      <div className="space-y-3">
        {project.transcriptEvents.map((event) => (
          <TranscriptRow event={event} key={event.time} compact />
        ))}
      </div>
    </Panel>
  );
}

function FlagsPanel({ project }: { project: Project }) {
  return (
    <Panel title="Flags and pings" description="Alerts tied to team members and generated sections.">
      <div className="space-y-3">
        {project.team.map((member) => (
          <div className="flex items-start gap-3 rounded-habibiMd border border-gray-200 bg-gray-50 p-3" key={member.name}>
            <Avatar initials={member.initials} label={member.name} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                <Badge tone={member.tone}>{member.pings} pings</Badge>
              </div>
              <p className="mt-1 text-sm leading-5 text-gray-600">{member.focus}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ProjectSummaryCompact({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge tone={feasibilityTone(project.feasibility)}>Feasibility {project.feasibility}</Badge>
        <Badge tone="info">Kickoff only</Badge>
      </div>
      <p className="text-sm leading-6 text-gray-600">{project.summary}</p>
      <div className="space-y-3">
        <Progress label="Designer review" value={Math.min(95, 44 + project.reportAssets.filter((asset) => asset.assignee === "Gurney").length * 14)} />
        <Progress label="Report approval" value={Math.max(24, 86 - project.openRisks * 12)} tone={project.openRisks > 2 ? "error" : "warning"} />
      </div>
    </div>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="rounded-habibiLg border border-gray-200 bg-white p-5 shadow-habibiXs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar initials={member.initials} label={member.name} status={member.status === "Blocked" ? "away" : "online"} />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{member.role}</p>
          </div>
        </div>
        <Badge tone={member.tone}>{member.status}</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-gray-600">{member.focus}</p>
      <div className="mt-5">
        <Progress label="Capacity allocated" value={member.capacity} tone={member.tone} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {member.assets.map((asset) => (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600" key={asset}>
            {asset}
          </span>
        ))}
      </div>
    </article>
  );
}

function CapabilityMatrix({ project }: { project: Project }) {
  return (
    <Panel title="Capability and feasibility matrix" description="Reference profile Baymax uses before applying risk flags.">
      <div className="overflow-x-auto rounded-habibiMd border border-gray-200">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Capability</th>
              <th className="px-4 py-3">Coverage</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {project.capabilityRows.map((row) => (
              <tr key={row.capability}>
                <td className="px-4 py-3 font-medium text-gray-900">{row.capability}</td>
                <td className="px-4 py-3">
                  <Badge tone={row.coverage === "Blocked" ? "error" : row.coverage === "Needs review" ? "warning" : "success"}>
                    {row.coverage}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{row.owner}</td>
                <td className="px-4 py-3 text-gray-600">{row.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function SettingsPanel({
  icon: Icon,
  items,
  title,
}: {
  icon: LucideIcon;
  items: Array<[string, string]>;
  title: string;
}) {
  return (
    <Panel title={title}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-habibiMd bg-brand-50 text-brand-700">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <div className="divide-y divide-gray-100">
        {items.map(([label, value]) => (
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0" key={label}>
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-sm text-gray-500">{value}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MetricStrip({
  metrics,
}: {
  metrics: Array<{ delta: string; icon: LucideIcon; label: string; tone: Tone; value: string }>;
}) {
  return (
    <section className="grid overflow-hidden rounded-habibiLg border border-gray-200 bg-white shadow-habibiXs md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article className="border-b border-gray-200 p-5 last:border-b-0 md:border-r md:last:border-r-0 xl:border-b-0" key={metric.label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-500">{metric.label}</p>
              <Icon aria-hidden="true" className={["h-4 w-4", iconTone(metric.tone)].join(" ")} />
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
              <Badge tone={metric.tone}>{metric.delta}</Badge>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function PageHeader({
  actions,
  children,
  eyebrow,
  status,
  title,
}: {
  actions: React.ReactNode;
  children: React.ReactNode;
  eyebrow: string;
  status: React.ReactNode;
  title: string;
}) {
  return (
    <header className="rounded-habibiLg border border-gray-200 bg-white p-5 shadow-habibiXs">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase text-brand-700">{eyebrow}</p>
            {status}
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-500">{children}</p>
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
    </header>
  );
}

function Panel({
  actions,
  children,
  description,
  title,
}: {
  actions?: React.ReactNode;
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-habibiLg border border-gray-200 bg-white shadow-habibiXs">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function SectionHeading({ description, title }: { description: string; title: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>
    </div>
  );
}

function AssetCard({ asset }: { asset: ReportAsset }) {
  const Icon = asset.icon;

  return (
    <article className="rounded-habibiLg border border-gray-200 bg-white p-5 shadow-habibiXs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={["rounded-habibiMd p-3", iconBg(asset.tone)].join(" ")}>
            <Icon aria-hidden="true" className={["h-5 w-5", iconTone(asset.tone)].join(" ")} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">{asset.title}</h3>
            <p className="mt-1 text-xs font-medium text-gray-500">{asset.category}</p>
          </div>
        </div>
        <Badge tone={asset.tone}>{asset.status}</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-gray-600">{asset.description}</p>
      <p className="mt-3 rounded-habibiMd bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">{asset.evidence}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button icon={Eye} size="sm" variant="secondary">Open</Button>
        <Button icon={RefreshCw} size="sm" variant="ghost">Regenerate</Button>
      </div>
    </article>
  );
}

function TranscriptRow({
  compact = false,
  event,
}: {
  compact?: boolean;
  event: TranscriptEvent;
}) {
  const isQuestion = event.marker === "Question asked";

  return (
    <article
      className={[
        "rounded-habibiMd border p-4",
        isQuestion ? "border-brand-200 bg-brand-50" : "border-gray-200 bg-white",
        compact ? "p-3" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-500">{event.time}</span>
          <Badge tone={isQuestion ? "brand" : event.marker === "Risk" ? "warning" : "neutral"}>{event.marker}</Badge>
        </div>
        <span className="text-xs font-medium text-gray-500">{event.actor}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-gray-700">{event.content}</p>
    </article>
  );
}

function QuestionTraceCard({ question }: { question: Question }) {
  return (
    <article className="rounded-habibiMd border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs text-gray-500">{question.time}</span>
        <Badge tone={question.status === "Pending" ? "warning" : question.status === "Team requested" ? "info" : "success"}>
          {question.status}
        </Badge>
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-gray-900">{question.question}</p>
      <p className="mt-2 text-xs text-gray-500">
        {question.category} - {question.askedBy} to {question.assignee}
      </p>
    </article>
  );
}

function ActionRow({ item }: { item: ActionItem }) {
  return (
    <div className="flex items-start gap-3 rounded-habibiMd border border-gray-200 bg-white p-3">
      <StatusDot tone={item.tone} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
        <p className="mt-1 text-sm leading-5 text-gray-500">{item.meta}</p>
      </div>
      <ChevronRight aria-hidden="true" className="mt-1 h-4 w-4 text-gray-400" />
    </div>
  );
}

function Field({ children, label, wide = false }: { children: React.ReactNode; label: string; wide?: boolean }) {
  return (
    <label className={wide ? "lg:col-span-2" : undefined}>
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-habibiMd border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-gray-700">{value}</p>
    </div>
  );
}

function InlineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-habibiMd border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-habibiSm bg-gray-100 px-2 py-1 text-gray-600">
      <span className="font-semibold text-gray-900">{value}</span> {label}
    </span>
  );
}

function Progress({ label, tone = "brand", value }: { label: string; tone?: Tone; value: number }) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-mono text-xs text-gray-500">{safeValue}%</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        className="h-2 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
      >
        <div className={["h-full rounded-full transition-all", progressTone(tone)].join(" ")} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

function Button({
  children,
  icon: Icon,
  onClick,
  size = "md",
  variant = "primary",
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      className={[
        "focus-ring inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-habibiMd border font-semibold transition-colors",
        size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm",
        variant === "primary"
          ? "border-brand-700 bg-brand-700 text-white shadow-habibiXs hover:border-brand-600 hover:bg-brand-600"
          : variant === "secondary"
            ? "border-gray-300 bg-white text-gray-700 shadow-habibiXs hover:bg-gray-50"
            : "border-transparent bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={["inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", badgeTone(tone)].join(" ")}>
      {children}
    </span>
  );
}

function StatusPill({ children, icon: Icon, tone }: { children: React.ReactNode; icon: LucideIcon; tone: Tone }) {
  return (
    <span className={["inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", badgeTone(tone)].join(" ")}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function StatusDot({ tone = "success" }: { tone?: Tone }) {
  return <span aria-hidden="true" className={["mt-1 h-2.5 w-2.5 shrink-0 rounded-full", dotTone(tone)].join(" ")} />;
}

function IconButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      aria-label={label}
      className="focus-ring flex h-10 w-10 items-center justify-center rounded-habibiMd text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      type="button"
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}

function Avatar({
  initials,
  label,
  status,
}: {
  initials: string;
  label: string;
  status?: "online" | "away";
}) {
  return (
    <div className="relative inline-flex">
      <div
        aria-label={label}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-brand-700 text-sm font-semibold text-white shadow-habibiXs"
        role="img"
      >
        {initials}
      </div>
      {status ? (
        <span
          aria-label={status}
          className={[
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
            status === "online" ? "bg-success-500" : "bg-warning-500",
          ].join(" ")}
          role="status"
        />
      ) : null}
    </div>
  );
}

function feasibilityTone(feasibility: Feasibility): Tone {
  return feasibility === "Green" ? "success" : feasibility === "Yellow" ? "warning" : "error";
}

function statusTone(status: ProjectStatus): Tone {
  if (status === "Ready for approval") {
    return "success";
  }
  if (status === "Blocked") {
    return "error";
  }
  if (status === "In discovery") {
    return "info";
  }
  return "warning";
}

function badgeTone(tone: Tone) {
  const classes: Record<Tone, string> = {
    brand: "bg-brand-50 text-brand-700",
    error: "bg-error-50 text-error-700",
    info: "bg-info-50 text-info-700",
    neutral: "bg-gray-100 text-gray-700",
    success: "bg-success-50 text-success-700",
    warning: "bg-warning-50 text-warning-700",
  };

  return classes[tone];
}

function iconTone(tone: Tone) {
  const classes: Record<Tone, string> = {
    brand: "text-brand-700",
    error: "text-error-600",
    info: "text-info-600",
    neutral: "text-gray-500",
    success: "text-success-600",
    warning: "text-warning-600",
  };

  return classes[tone];
}

function iconBg(tone: Tone) {
  const classes: Record<Tone, string> = {
    brand: "bg-brand-50",
    error: "bg-error-50",
    info: "bg-info-50",
    neutral: "bg-gray-100",
    success: "bg-success-50",
    warning: "bg-warning-50",
  };

  return classes[tone];
}

function dotTone(tone: Tone) {
  const classes: Record<Tone, string> = {
    brand: "bg-brand-600",
    error: "bg-error-500",
    info: "bg-info-500",
    neutral: "bg-gray-400",
    success: "bg-success-500",
    warning: "bg-warning-500",
  };

  return classes[tone];
}

function progressTone(tone: Tone) {
  const classes: Record<Tone, string> = {
    brand: "bg-brand-700",
    error: "bg-error-500",
    info: "bg-info-500",
    neutral: "bg-gray-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
  };

  return classes[tone];
}
