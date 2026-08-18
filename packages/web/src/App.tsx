import {
  type Course,
  type GradeLetter,
  type SemesterGPA,
  addCourse,
  calculateCumulativeGPA,
  deleteCourse,
  getCourses,
  projectFinalGPA,
  updateCourse,
} from '@gradetracker/core';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useCallback, useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const GRADE_OPTIONS: GradeLetter[] = [
  'A+',
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
  'D+',
  'D',
  'E',
  'F',
];

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [cgpa, setCgpa] = useState(0);
  const [semesters, setSemesters] = useState<SemesterGPA[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState<Course | null>(null);
  const [projection, setProjection] = useState<{ target: number; remaining: number }>({
    target: 3.5,
    remaining: 30,
  });
  const [projectionResult, setProjectionResult] = useState<any>(null);

  const refresh = useCallback(() => {
    const data = getCourses();
    setCourses(data);
    const cgpaData = calculateCumulativeGPA(data);
    setCgpa(cgpaData.cgpa);
    setSemesters(cgpaData.semesters);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAddCourse = (course: Omit<Course, 'id'>) => {
    addCourse({ ...course, id: crypto.randomUUID() });
    refresh();
    setShowAddModal(false);
  };

  const handleSetGrade = (id: string, grade: GradeLetter) => {
    updateCourse(id, { grade, isCompleted: true });
    refresh();
    setShowGradeModal(null);
  };

  const handleDelete = (id: string) => {
    deleteCourse(id);
    refresh();
  };

  const handleProject = () => {
    const result = projectFinalGPA(courses, projection.target, projection.remaining);
    setProjectionResult(result);
  };

  return (
    <div className="min-h-screen bg-lacquer">
      {/* Header */}
      <header className="border-b border-graphite bg-lacquer-deep sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-kinpaku rounded-sm flex items-center justify-center">
              <svg
                className="w-6 h-6 text-lacquer-deep"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <h1 className="font-display font-light text-2xl tracking-tight">GradeTracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">CGPA: </span>
            <span className="font-display font-light text-2xl text-kinpaku">{cgpa.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Credits"
            value={courses.filter((c) => c.isCompleted).reduce((a, c) => a + c.credits, 0)}
            icon="📚"
          />
          <StatCard
            label="Completed"
            value={courses.filter((c) => c.isCompleted).length}
            icon="✅"
          />
          <StatCard
            label="In Progress"
            value={courses.filter((c) => !c.isCompleted).length}
            icon="⏳"
          />
          <StatCard label="Semesters" value={semesters.length} icon="📅" />
        </div>

        {/* GPA Trend Chart */}
        <section className="mb-8">
          <div className="bg-lacquer-raised border border-graphite rounded-lg p-6">
            <h2 className="font-display font-light text-xl mb-4">GPA Trend</h2>
            {semesters.length > 0 ? (
              <Line
                data={{
                  labels: semesters.map((s) => `S${s.semester} ${s.year}`),
                  datasets: [
                    {
                      label: 'Semester GPA',
                      data: semesters.map((s) => s.gpa),
                      borderColor: '#d4a843',
                      backgroundColor: 'rgba(212, 168, 67, 0.1)',
                      fill: true,
                      tension: 0.3,
                      pointBackgroundColor: '#d4a843',
                      pointBorderColor: '#121212',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                    },
                    {
                      label: 'Cumulative GPA',
                      data: semesters.map((_, i) => {
                        const subset = semesters.slice(0, i + 1);
                        const totalPoints = subset.reduce((a, c) => a + c.gpa * c.totalCredits, 0);
                        const totalCredits = subset.reduce((a, c) => a + c.totalCredits, 0);
                        return totalCredits > 0
                          ? Math.round((totalPoints / totalCredits) * 100) / 100
                          : 0;
                      }),
                      borderColor: '#7dd3c0',
                      backgroundColor: 'rgba(125, 211, 192, 0.1)',
                      fill: false,
                      tension: 0.3,
                      pointBackgroundColor: '#7dd3c0',
                      pointBorderColor: '#121212',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                      borderDash: [5, 5],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { labels: { color: '#e0e0e0' } },
                  },
                  scales: {
                    y: {
                      min: 0,
                      max: 4,
                      ticks: { color: '#b8b8b8' },
                      grid: { color: 'rgba(255,255,255,0.05)' },
                    },
                    x: { ticks: { color: '#b8b8b8' }, grid: { display: false } },
                  },
                }}
              />
            ) : (
              <p className="text-text-muted text-center py-8">
                No semester data yet. Add courses to see your GPA trend.
              </p>
            )}
          </div>
        </section>

        {/* Semester Breakdown */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-light text-xl">Semester Breakdown</h2>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-kinpaku text-lacquer-deep font-body font-medium rounded-sm hover:bg-kinpaku-pale transition-colors"
            >
              + Add Course
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {semesters.length > 0 ? (
              semesters.map((sem) => (
                <SemesterCard
                  key={`${sem.year}-${sem.semester}`}
                  semester={sem}
                  onDelete={handleDelete}
                  onSetGrade={setShowGradeModal}
                />
              ))
            ) : (
              <div className="col-span-2 bg-lacquer-raised border border-graphite rounded-lg p-8 text-center text-text-muted">
                No semesters yet. Click "Add Course" to get started.
              </div>
            )}
          </div>
        </section>

        {/* Projection */}
        <section className="mb-8">
          <div className="bg-lacquer-raised border border-graphite rounded-lg p-6">
            <h2 className="font-display font-light text-xl mb-4">Final GPA Projection</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={projection.target}
                onChange={(e) =>
                  setProjection({ ...projection, target: Number.parseFloat(e.target.value) || 0 })
                }
                className="bg-lacquer-deep border border-graphite rounded-sm px-4 py-2 text-champagne placeholder-text-muted focus:border-kinpaku focus:outline-none"
                placeholder="Target CGPA (e.g., 3.5)"
              />
              <input
                type="number"
                min="0"
                value={projection.remaining}
                onChange={(e) =>
                  setProjection({
                    ...projection,
                    remaining: Number.parseInt(e.target.value, 10) || 0,
                  })
                }
                className="bg-lacquer-deep border border-graphite rounded-sm px-4 py-2 text-champagne placeholder-text-muted focus:border-kinpaku focus:outline-none"
                placeholder="Remaining Credits"
              />
              <button
                type="button"
                onClick={handleProject}
                className="px-4 py-2 bg-kinpaku text-lacquer-deep font-body font-medium rounded-sm hover:bg-kinpaku-pale transition-colors"
              >
                Calculate
              </button>
            </div>
            {projectionResult && <ProjectionResult result={projectionResult} />}
          </div>
        </section>

        {/* Grade Distribution */}
        <section>
          <div className="bg-lacquer-raised border border-graphite rounded-lg p-6">
            <h2 className="font-display font-light text-xl mb-4">Grade Distribution</h2>
            <GradeDistributionChart courses={courses} />
          </div>
        </section>
      </main>

      {/* Add Course Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <AddCourseForm onSubmit={handleAddCourse} onCancel={() => setShowAddModal(false)} />
        </Modal>
      )}

      {/* Set Grade Modal */}
      {showGradeModal && (
        <Modal onClose={() => setShowGradeModal(null)}>
          <SetGradeForm
            course={showGradeModal}
            onSubmit={handleSetGrade}
            onCancel={() => setShowGradeModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-lacquer-raised border border-graphite rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-sm font-mono tracking-wide uppercase">{label}</p>
          <p className="font-display font-light text-3xl text-kinpaku mt-1">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

function SemesterCard({
  semester,
  onDelete,
  onSetGrade,
}: {
  semester: SemesterGPA;
  onDelete: (id: string) => void;
  onSetGrade: (course: Course) => void;
}) {
  return (
    <div className="bg-lacquer-raised border border-graphite rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-body font-medium">
          Semester {semester.semester}, {semester.year}
        </h3>
        <span className="px-3 py-1 bg-kinpaku text-lacquer-deep text-sm font-mono rounded-sm">
          {semester.gpa.toFixed(2)}
        </span>
      </div>
      <p className="text-text-muted text-sm mb-4">
        Credits: {semester.earnedCredits}/{semester.totalCredits}
      </p>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {semester.courses.map((course: Course) => (
          <div
            key={course.id}
            className="flex items-center justify-between p-3 bg-lacquer-deep rounded-sm border border-graphite"
          >
            <div className="flex-1 min-w-0">
              <p className="font-body truncate">{course.name}</p>
              <p className="text-text-muted text-sm font-mono">
                {course.code} • {course.credits} credits
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {course.isCompleted ? (
                <span className="px-2 py-1 bg-kinpaku text-lacquer-deep text-xs font-mono rounded-sm">
                  {course.grade}
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSetGrade(course)}
                    className="px-3 py-1 border border-graphite text-text-warm text-sm rounded-sm hover:border-kinpaku hover:text-kinpaku transition-colors"
                  >
                    Set Grade
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(course.id)}
                    className="px-2 py-1 text-text-muted hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectionResult({ result }: { result: any }) {
  const achievable = result.isAchievable;
  return (
    <div
      className={`p-4 rounded-lg border ${achievable ? 'border-patina/30 bg-patina/5' : 'border-red-500/30 bg-red-500/5'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-body font-medium">
          {achievable ? '✓ Achievable' : '✗ Not Achievable'}
        </h4>
        <span className="font-display font-light text-xl text-kinpaku">
          {result.requiredAverage.toFixed(2)}
        </span>
      </div>
      <p className="text-text-muted text-sm">
        Required average for remaining {result.remainingCredits} credits to reach{' '}
        {result.targetCGPA.toFixed(2)} CGPA
      </p>
      {!achievable && result.requiredAverage > 4 && (
        <p className="text-text-muted text-sm mt-2 text-amber-400">
          You would need an average of {result.requiredAverage.toFixed(2)} — impossible on 4.0 scale
        </p>
      )}
      {achievable && result.requiredAverage <= 0 && (
        <p className="text-text-muted text-sm mt-2 text-patina">
          You have already secured enough points to meet or exceed your target CGPA!
        </p>
      )}
    </div>
  );
}

function GradeDistributionChart({ courses }: { courses: Course[] }) {
  const completed = courses.filter((c) => c.isCompleted && c.grade);
  const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'E', 'F'];
  const counts = grades.map((g) => completed.filter((c) => c.grade === g).length);
  const colors = [
    '#d4a843',
    '#d4a843',
    '#c8a040',
    '#b8b840',
    '#a0a040',
    '#888840',
    '#7dd3c0',
    '#7dd3c0',
    '#6cccac',
    '#5bb898',
    '#4aa084',
    '#cc4444',
    '#aa3333',
  ];

  if (completed.length === 0) {
    return <p className="text-text-muted text-center py-8">No graded courses yet.</p>;
  }

  return (
    <div className="h-64">
      <Doughnut
        data={{
          labels: grades,
          datasets: [
            {
              data: counts,
              backgroundColor: colors,
              borderWidth: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'right', labels: { color: '#e0e0e0', font: { size: 11 } } },
          },
        }}
      />
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      role="presentation"
      className="fixed inset-0 bg-lacquer-deep/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-lacquer-raised border border-graphite rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function AddCourseForm({
  onSubmit,
  onCancel,
}: { onSubmit: (course: Omit<Course, 'id'>) => void; onCancel: () => void }) {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    code: '',
    name: '',
    credits: 3,
    semester: 1,
    year: currentYear,
    grade: '',
  });

  return (
    <div>
      <h3 className="font-display font-light text-xl mb-4">Add Course</h3>
      <div className="space-y-4">
        <input
          placeholder="Course Code (e.g., ICT143)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          className="w-full bg-lacquer-deep border border-graphite rounded-sm px-4 py-2 text-champagne placeholder-text-muted focus:border-kinpaku focus:outline-none"
        />
        <input
          placeholder="Course Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-lacquer-deep border border-graphite rounded-sm px-4 py-2 text-champagne placeholder-text-muted focus:border-kinpaku focus:outline-none"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            min="1"
            max="6"
            value={form.credits}
            onChange={(e) =>
              setForm({ ...form, credits: Number.parseInt(e.target.value, 10) || 1 })
            }
            className="bg-lacquer-deep border border-graphite rounded-sm px-3 py-2 text-champagne focus:border-kinpaku focus:outline-none"
            placeholder="Credits"
          />
          <input
            type="number"
            min="1"
            max="8"
            value={form.semester}
            onChange={(e) =>
              setForm({ ...form, semester: Number.parseInt(e.target.value, 10) || 1 })
            }
            className="bg-lacquer-deep border border-graphite rounded-sm px-3 py-2 text-champagne focus:border-kinpaku focus:outline-none"
            placeholder="Semester"
          />
          <input
            type="number"
            min="2020"
            max="2030"
            value={form.year}
            onChange={(e) =>
              setForm({ ...form, year: Number.parseInt(e.target.value, 10) || currentYear })
            }
            className="bg-lacquer-deep border border-graphite rounded-sm px-3 py-2 text-champagne focus:border-kinpaku focus:outline-none"
            placeholder="Year"
          />
        </div>
        <select
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
          className="w-full bg-lacquer-deep border border-graphite rounded-sm px-4 py-2 text-champagne focus:border-kinpaku focus:outline-none"
        >
          <option value="">Grade (optional)</option>
          {GRADE_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-graphite text-text-warm rounded-sm hover:border-kinpaku hover:text-kinpaku transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() =>
            onSubmit({
              code: form.code,
              name: form.name,
              credits: form.credits,
              semester: form.semester,
              year: form.year,
              grade: form.grade ? (form.grade as GradeLetter) : undefined,
              isCompleted: !!form.grade,
            })
          }
          disabled={!form.code || !form.name || !form.semester || !form.year}
          className="flex-1 px-4 py-2 bg-kinpaku text-lacquer-deep font-body font-medium rounded-sm hover:bg-kinpaku-pale transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Course
        </button>
      </div>
    </div>
  );
}

function SetGradeForm({
  course,
  onSubmit,
  onCancel,
}: { course: Course; onSubmit: (id: string, grade: GradeLetter) => void; onCancel: () => void }) {
  const [grade, setGrade] = useState<GradeLetter>(course.grade || 'A');

  return (
    <div>
      <h3 className="font-display font-light text-xl mb-2">Set Grade</h3>
      <p className="text-text-muted mb-4">
        {course.code} — {course.name}
      </p>
      <select
        value={grade}
        onChange={(e) => setGrade(e.target.value as GradeLetter)}
        className="w-full bg-lacquer-deep border border-graphite rounded-sm px-4 py-2 text-champagne focus:border-kinpaku focus:outline-none mb-4"
      >
        {GRADE_OPTIONS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-graphite text-text-warm rounded-sm hover:border-kinpaku hover:text-kinpaku transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSubmit(course.id, grade)}
          className="flex-1 px-4 py-2 bg-kinpaku text-lacquer-deep font-body font-medium rounded-sm hover:bg-kinpaku-pale transition-colors"
        >
          Save Grade
        </button>
      </div>
    </div>
  );
}

export default App;
