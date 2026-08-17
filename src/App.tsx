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
  Eye,
  FileText,
  FolderKanban,
  Gauge,
  GitBranch,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  Lock,
  MessageSquareText,
  MonitorDot,
  Paintbrush,
  PanelRightOpen,
  Plus,
  RefreshCw,
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

type NavItem = {
  id: ViewId;
  icon: LucideIcon;
  label: string;
  meta: string;
};

type TeamMember = {
  assets: string[];
  capacity: string;
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

const navItems: NavItem[] = [
  { id: "inbox", icon: LayoutDashboard, label: "My inbox", meta: "UX/UI first" },
  { id: "project", icon: FolderKanban, label: "Project", meta: "Kickoff view" },
  { id: "transcript", icon: MessageSquareText, label: "Transcripts", meta: "Calls and chat" },
  { id: "team", icon: Users, label: "Team", meta: "Skills and pings" },
  { id: "reports", icon: FileText, label: "Reports", meta: "Assets by owner" },
  { id: "admin", icon: Settings, label: "Admin", meta: "Bot controls" },
];

const teamMembers: TeamMember[] = [
  {
    assets: ["UI flow diagram", "Screen inventory", "UX risks report"],
    capacity: "68%",
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
    capacity: "74%",
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
    capacity: "58%",
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
    capacity: "44%",
    focus: "Transcript storage, data access, retention, source policy",
    initials: "DA",
    name: "Data Owner",
    pings: 3,
    role: "Data / Databases",
    status: "Blocked",
    tone: "error",
  },
];

const questions: Question[] = [
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
];

const reportAssets: ReportAsset[] = [
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
];

const transcriptEvents = [
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

export function App() {
  const [activeView, setActiveView] = useState<ViewId>("inbox");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("ux");
  const [activeDiagram, setActiveDiagram] = useState<DiagramId>("ui");
  const activeCategoryData = categories.find((category) => category.id === activeCategory) ?? categories[0];

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0 });
  }, [activeView]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col gap-4 p-3 lg:flex-row lg:p-4">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <div className="min-w-0 flex-1 space-y-4">
          <Topbar />
          <main className="min-w-0">
            {activeView === "inbox" ? <InboxView onViewChange={setActiveView} /> : null}
            {activeView === "project" ? (
              <ProjectView
                activeCategory={activeCategory}
                activeCategoryData={activeCategoryData}
                activeDiagram={activeDiagram}
                onCategoryChange={setActiveCategory}
                onDiagramChange={setActiveDiagram}
              />
            ) : null}
            {activeView === "transcript" ? <TranscriptView /> : null}
            {activeView === "team" ? <TeamView /> : null}
            {activeView === "reports" ? <ReportsView /> : null}
            {activeView === "admin" ? <AdminView /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  activeView,
  onViewChange,
}: {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
}) {
  return (
    <aside className="rounded-habibiLg border border-gray-200 bg-white p-3 shadow-habibiXs lg:min-h-[calc(100vh-2rem)] lg:w-[280px]">
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
      <div className="mt-4 rounded-habibiMd border border-warning-200 bg-warning-50 p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle aria-hidden="true" className="h-4 w-4 text-warning-700" />
          <p className="text-sm font-semibold text-warning-700">Feasibility watch</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-warning-700">
          Capability profile needs owner review before Baymax scores this project as delivery-ready.
        </p>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="flex flex-col gap-3 rounded-habibiLg border border-gray-200 bg-white px-4 py-3 shadow-habibiXs xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900">Project Apollo kickoff</p>
        <p className="text-xs text-gray-500">Microsoft Teams capture - last synced today at 4:26 PM</p>
      </div>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <label className="focus-within:shadow-[var(--habibi-focus-ring)] flex h-10 min-w-0 items-center gap-2 rounded-habibiMd border border-gray-300 bg-white px-3 text-sm text-gray-500 sm:w-[340px]">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
            placeholder="Search transcript, reports, team"
            type="search"
          />
        </label>
        <div className="flex items-center gap-2">
          <IconButton icon={HelpCircle} label="Help" />
          <IconButton icon={Bell} label="Notifications" />
          <Avatar initials="GK" label="Gurney profile" status="online" />
        </div>
      </div>
    </header>
  );
}

function InboxView({ onViewChange }: { onViewChange: (view: ViewId) => void }) {
  const designerAssets = reportAssets.filter((asset) => asset.assignee === "Gurney");

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <>
            <Button icon={MessageSquareText} onClick={() => onViewChange("transcript")} variant="secondary">
              Open transcript
            </Button>
            <Button icon={PanelRightOpen} onClick={() => onViewChange("project")}>
              Project dashboard
            </Button>
          </>
        }
        eyebrow="UX/UI workspace"
        status={<StatusPill icon={Sparkles} tone="brand">4 items routed to you</StatusPill>}
        title="Your Baymax inbox"
      >
        Role-based intake for the UX/UI front end designer. Baymax brings your assigned reports, visual assets,
        transcript highlights, and open questions to the front of the dashboard.
      </PageHeader>

      <MetricStrip
        metrics={[
          { delta: "2 need review", icon: Paintbrush, label: "Visual assets", tone: "brand", value: "5" },
          { delta: "3 Baymax markers", icon: MessageSquareText, label: "Transcript mentions", tone: "info", value: "12" },
          { delta: "1 awaiting you", icon: ClipboardCheck, label: "Approval steps", tone: "warning", value: "4" },
          { delta: "Updated now", icon: Gauge, label: "UX feasibility", tone: "success", value: "Green" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="space-y-4">
          <SectionHeading
            description="Baymax groups your project-specific handoff before the wider team queue."
            title="Sent to Gurney"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {designerAssets.map((asset) => (
              <AssetCard asset={asset} key={asset.title} />
            ))}
          </div>
          <Panel title="Transcript highlights" actions={<Button icon={Eye} variant="secondary">Review markers</Button>}>
            <div className="space-y-3">
              {transcriptEvents.slice(1, 4).map((event) => (
                <TranscriptRow event={event} key={event.time} />
              ))}
            </div>
          </Panel>
        </section>

        <aside className="space-y-4">
          <Panel title="Designer action queue" description="Assigned from kickoff output and Teams chat updates.">
            <div className="space-y-3">
              <ActionRow label="Review UI flow diagram" meta="Generated from screens and user needs" tone="brand" />
              <ActionRow label="Confirm dashboard module order" meta="Project summary, monitor, diagrams, questions" tone="warning" />
              <ActionRow label="Approve UX notes for proposal" meta="Required before final project packet" tone="success" />
              <ActionRow label="Reply to retention visibility question" meta="Data owner needs dashboard access expectations" tone="info" />
            </div>
          </Panel>
          <Panel title="Project snapshot">
            <ProjectSummaryCompact />
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function ProjectView({
  activeCategory,
  activeCategoryData,
  activeDiagram,
  onCategoryChange,
  onDiagramChange,
}: {
  activeCategory: CategoryId;
  activeCategoryData: (typeof categories)[number];
  activeDiagram: DiagramId;
  onCategoryChange: (category: CategoryId) => void;
  onDiagramChange: (diagram: DiagramId) => void;
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
        status={<StatusPill icon={Clock3} tone="warning">Kickoff review in progress</StatusPill>}
        title="Project Apollo"
      >
        Structured kickoff output from Teams: project summary, technical categories, generated diagrams, questions,
        feasibility flags, and team review status.
      </PageHeader>

      <MetricStrip
        metrics={[
          { delta: "Teams connected", icon: Bot, label: "Bot state", tone: "success", value: "Listening" },
          { delta: "7 questions logged", icon: MessageSquareText, label: "Transcript coverage", tone: "info", value: "84%" },
          { delta: "Data and capacity", icon: AlertTriangle, label: "Open risks", tone: "warning", value: "2" },
          { delta: "4 reviewers", icon: Users, label: "Team pings", tone: "brand", value: "14" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-4">
          <ProjectSummaryPanel />
          <TechnicalBreakdown
            activeCategory={activeCategory}
            activeCategoryData={activeCategoryData}
            onCategoryChange={onCategoryChange}
          />
          <DiagramPanel activeDiagram={activeDiagram} onDiagramChange={onDiagramChange} />
          <QuestionsLog />
        </section>
        <aside className="space-y-4">
          <LiveMonitorPanel />
          <FlagsPanel />
        </aside>
      </div>
    </div>
  );
}

function TranscriptView() {
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
        status={<StatusPill icon={MessageSquareText} tone="info">5 question markers</StatusPill>}
        title="Transcript review"
      >
        Call and chat evidence with Baymax questions pinned to the exact moments they were asked or requested.
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Panel title="Kickoff transcript" description="Teams call transcript with Baymax question markers.">
          <div className="space-y-3">
            {transcriptEvents.map((event) => (
              <TranscriptRow event={event} key={event.time} />
            ))}
          </div>
        </Panel>
        <Panel title="Question trace" description="Questions asked live, pending, or queued by the team.">
          <div className="space-y-3">
            {questions.map((question) => (
              <QuestionTraceCard question={question} key={`${question.time}-${question.question}`} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function TeamView() {
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
        status={<StatusPill icon={Gauge} tone="warning">Feasibility model incomplete</StatusPill>}
        title="People attached to Project Apollo"
      >
        Team members, skills, capacity, Baymax pings, and assigned outputs used to keep feasibility flags grounded.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        {teamMembers.map((member) => (
          <TeamMemberCard member={member} key={member.name} />
        ))}
      </div>
      <CapabilityMatrix />
    </div>
  );
}

function ReportsView() {
  const groupedAssets = useMemo(
    () =>
      teamMembers.map((member) => ({
        member,
        assets: reportAssets.filter((asset) => asset.assignee === member.name),
      })),
    [],
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
        status={<StatusPill icon={CheckCircle2} tone="success">3 ready for review</StatusPill>}
        title="Generated project outputs"
      >
        Reports, diagrams, and generated visual assets are grouped by the team member who needs to review or approve them.
      </PageHeader>

      <div className="space-y-4">
        {groupedAssets.map(({ assets, member }) => (
          <Panel
            actions={<Badge tone={member.tone}>{member.status}</Badge>}
            key={member.name}
            title={`${member.name} - ${member.role}`}
          >
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

function AdminView() {
  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <>
            <Button icon={ShieldCheck} variant="secondary">Review access</Button>
            <Button icon={CheckCircle2}>Save settings</Button>
          </>
        }
        eyebrow="Admin settings"
        status={<StatusPill icon={Lock} tone="info">Protected workspace</StatusPill>}
        title="Baymax controls"
      >
        Configure bot behavior, Teams access, capability profiles, question templates, data handling, and review gates.
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsPanel
          icon={Bot}
          items={[
            ["Kickoff-only meeting mode", "Enabled"],
            ["Live Teams chat monitoring", "Enabled for project channel"],
            ["Real-time question guardrails", "Human approved templates"],
          ]}
          title="Bot behavior"
        />
        <SettingsPanel
          icon={ShieldCheck}
          items={[
            ["Teams meeting access", "Awaiting IT review"],
            ["Transcript storage", "Project workspace only"],
            ["Generated report access", "Reviewer and admin roles"],
          ]}
          title="Access and data"
        />
        <SettingsPanel
          icon={Gauge}
          items={[
            ["Skills profile freshness", "12 days old"],
            ["Capacity profile owner", "Delivery operations"],
            ["Risk flag confidence", "Medium"],
          ]}
          title="Feasibility model"
        />
        <SettingsPanel
          icon={ClipboardCheck}
          items={[
            ["UX/UI question pack", "Active"],
            ["Architecture question pack", "Needs review"],
            ["Data retention question pack", "Draft"],
          ]}
          title="Question templates"
        />
      </div>
    </div>
  );
}

function ProjectSummaryPanel() {
  return (
    <Panel title="Project summary" description="Status, feasibility, last update, project scope, and review state.">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="warning">Yellow feasibility</Badge>
            <Badge tone="success">Teams connected</Badge>
            <Badge tone="brand">Proposal draft</Badge>
          </div>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            Baymax captured a kickoff-only meeting brief and converted it into a reviewable proposal with technical
            categories, generated visuals, open questions, and routed team approvals.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InlineMetric label="Last update" value="4:26 PM" />
            <InlineMetric label="Reviewers" value="4 active" />
            <InlineMetric label="Approval" value="2 of 6" />
          </div>
        </div>
        <div className="rounded-habibiMd border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">Attached team</p>
          <div className="mt-4 flex -space-x-2">
            {teamMembers.map((member) => (
              <Avatar initials={member.initials} key={member.name} label={member.name} status="online" />
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <Progress label="Transcript reviewed" value={84} />
            <Progress label="Capability profile" value={62} tone="warning" />
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
}: {
  activeCategory: CategoryId;
  activeCategoryData: (typeof categories)[number];
  onCategoryChange: (category: CategoryId) => void;
}) {
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
        <InfoBlock label="Review state" value={activeCategory === "data" ? "Blocked by retention answer" : "Ready for owner review"} />
      </div>
      <div className="mt-5 rounded-habibiMd border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <StatusDot tone={activeCategoryData.tone} />
          <p className="text-sm font-semibold text-gray-900">{activeCategoryData.label} evidence</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Baymax links each category back to transcript lines, Teams chat updates, generated reports, and team pings so
          reviewers can see why the proposal changed.
        </p>
      </div>
    </Panel>
  );
}

function DiagramPanel({
  activeDiagram,
  onDiagramChange,
}: {
  activeDiagram: DiagramId;
  onDiagramChange: (diagram: DiagramId) => void;
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
      <DiagramCanvas type={activeDiagram} />
    </Panel>
  );
}

function DiagramCanvas({ type }: { type: DiagramId }) {
  const nodes =
    type === "ui"
      ? ["Designer inbox", "Project dashboard", "Transcript markers", "Reports and assets"]
      : type === "architecture"
        ? ["Teams call", "Baymax bot", "Intake framework", "Admin dashboard"]
        : ["Transcript store", "Structured proposal", "Report assets", "Review archive"];

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

function QuestionsLog() {
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
            {questions.map((question) => (
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

function LiveMonitorPanel() {
  return (
    <Panel title="Chat and meeting monitor" description="Recent Teams activity Baymax is tracking for this kickoff.">
      <div className="space-y-3">
        {transcriptEvents.map((event) => (
          <TranscriptRow event={event} key={event.time} compact />
        ))}
      </div>
    </Panel>
  );
}

function FlagsPanel() {
  return (
    <Panel title="Flags and pings" description="Alerts tied to team members and generated sections.">
      <div className="space-y-3">
        {teamMembers.map((member) => (
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

function ProjectSummaryCompact() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge tone="warning">Feasibility yellow</Badge>
        <Badge tone="info">Kickoff only</Badge>
      </div>
      <p className="text-sm leading-6 text-gray-600">
        Baymax captured a Teams kickoff and generated a structured project packet for team review.
      </p>
      <div className="space-y-3">
        <Progress label="Designer review" value={72} />
        <Progress label="Report approval" value={46} tone="warning" />
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
        <Progress label="Capacity allocated" value={Number(member.capacity.replace("%", ""))} tone={member.tone} />
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

function CapabilityMatrix() {
  const rows = [
    ["UX/UI flows", "Covered", "Gurney", "Current design-library patterns available"],
    ["Front-end build", "Covered", "Front End Lead", "React/Tailwind stack aligns"],
    ["Teams integration", "Needs review", "Back End Lead", "Bot Framework and Graph path unresolved"],
    ["Data retention", "Blocked", "Data Owner", "Storage and access policy needed"],
  ];

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
            {rows.map(([capability, coverage, owner, evidence]) => (
              <tr key={capability}>
                <td className="px-4 py-3 font-medium text-gray-900">{capability}</td>
                <td className="px-4 py-3">
                  <Badge tone={coverage === "Blocked" ? "error" : coverage === "Needs review" ? "warning" : "success"}>
                    {coverage}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{owner}</td>
                <td className="px-4 py-3 text-gray-600">{evidence}</td>
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
  event: (typeof transcriptEvents)[number];
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

function ActionRow({ label, meta, tone }: { label: string; meta: string; tone: Tone }) {
  return (
    <div className="flex items-start gap-3 rounded-habibiMd border border-gray-200 bg-white p-3">
      <StatusDot tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="mt-1 text-sm leading-5 text-gray-500">{meta}</p>
      </div>
      <ChevronRight aria-hidden="true" className="mt-1 h-4 w-4 text-gray-400" />
    </div>
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

function Progress({ label, tone = "brand", value }: { label: string; tone?: Tone; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-mono text-xs text-gray-500">{value}%</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value}
        className="h-2 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
      >
        <div className={["h-full rounded-full transition-all", progressTone(tone)].join(" ")} style={{ width: `${value}%` }} />
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
