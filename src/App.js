import React, { useState, useEffect } from 'react';
import {
  Target,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  Award,
  Play,
  Pause,
  StopCircle,
} from "react-feather";
import Papa from 'papaparse';
import "./styles.css";

const rewards = [
  "☕ Fancy coffee drink",
  "🚶‍♂️ 30-minute walk outside",
  "🎬 Movie night",
  "🍕 Order takeout",
  "📚 Buy a new book",
  "🎮 1-hour video game break",
  "🍰 Dessert of your choice",
  "📞 Call a friend",
  "🛁 Bubble bath",
  "💐 Buy flowers",
  "🏛️ Visit a museum",
  "🍽️ Try a new restaurant",
  "🧘‍♀️ 15-minute meditation",
  "🧖‍♀️ Face mask/self-care",
  "🍦 Ice cream treat",
];

const parseJobs = () => {
  const validJobs = [

  ];

  // Add application tracking state and fun elements
  return validJobs.map((job, index) => ({
    ...job,
    id: index + 1,
    status: "Not Started",
    priority: Math.floor(Math.random() * 3) + 1, // Random priority 1-3
    deadline: new Date().toISOString().split('T')[0],
    difficulty: Math.floor(Math.random() * 5) + 1, // Random difficulty 1-5
    reward: rewards[index % rewards.length],
    progress: 0,
  }));
};

const JobApplicationTracker = () => {
  const today = new Date();

  // Timer state
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // New job form state
  const [newJob, setNewJob] = useState({ title: '', org: '', url: '' });

  // Jobs state
  const [jobs, setJobs] = useState(parseJobs());
  const [completedCount, setCompletedCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedReward, setSelectedReward] = useState(rewards[0]);
  const [filter, setFilter] = useState({ status: '', priority: '' });

  // Calculate estimated time to completion for filtered jobs
  const filteredTotalMinutes = jobs.filter((job) => {
    return (
      (filter.status ? job.status === filter.status : true) &&
      (filter.priority ? job.priority === parseInt(filter.priority, 10) : true)
    );
  }).length * 10; // 10 minutes per job
  const filteredEstimatedHours = Math.floor(filteredTotalMinutes / 60);
  const filteredEstimatedMinutes = filteredTotalMinutes % 60;

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Timer controls
  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const stopTimer = () => {
    setIsRunning(false);
    setTimer(0);
  };

  // Add new job
  const addNewJob = () => {
    if (newJob.title && newJob.org && newJob.url) {
      setJobs([
        ...jobs,
        {
          ...newJob,
          id: jobs.length + 1,
          status: "Not Started",
          priority: 1,
          deadline: new Date().toISOString().split('T')[0],
          progress: 0,
        },
      ]);
      setNewJob({ title: '', org: '', url: '' });
    }
  };

  // Status options
  const statuses = [
    "Not Started",
    "Resume Updated",
    "Cover Letter Written",
    "Application Submitted",
    "Complete",
  ];

  // Update job status
  const updateStatus = (id, status) => {
    setJobs(
      jobs.map((job) => {
        if (job.id === id) {
          const newProgress = calculateProgress(status);
          const wasComplete = job.status === "Complete";
          const nowComplete = status === "Complete";

          if (!wasComplete && nowComplete) {
            setCompletedCount((prev) => {
              const newCount = prev + 1;
              if (newCount % 3 === 0) {
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 3000);
              }
              return newCount;
            });
          } else if (wasComplete && !nowComplete) {
            setCompletedCount((prev) => prev - 1);
          }

          return {
            ...job,
            status,
            progress: newProgress,
          };
        }
        return job;
      })
    );
  };

  // Calculate progress percentage based on status
  const calculateProgress = (status) => {
    switch (status) {
      case "Not Started":
        return 0;
      case "Resume Updated":
        return 25;
      case "Cover Letter Written":
        return 50;
      case "Application Submitted":
        return 75;
      case "Complete":
        return 100;
      default:
        return 0;
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Not Started":
        return "status-badge status-not-started";
      case "Resume Updated":
        return "status-badge status-resume";
      case "Cover Letter Written":
        return "status-badge status-cover-letter";
      case "Application Submitted":
        return "status-badge status-submitted";
      case "Complete":
        return "status-badge status-complete";
      default:
        return "status-badge status-not-started";
    }
  };

  // Get priority indicator
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 2:
        return <span className="priority-high">High Priority</span>;
      case 1:
        return <span className="priority-low">Low Priority</span>;
      default:
        return null;
    }
  };

  // Get difficulty stars
  const getDifficultyStars = (difficulty) => {
    return Array(difficulty)
      .fill(0)
      .map((_, i) => <Star key={i} className="difficulty-star" />);
  };

  // Sort jobs by deadline and priority
  const sortedJobs = [...jobs].sort((a, b) => {
    // First by deadline
    const dateA = new Date(a.deadline);
    const dateB = new Date(b.deadline);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;

    // Then by priority (higher number = higher priority)
    return b.priority - a.priority;
  });

  // Calculate overall completion
  const overallProgress =
    jobs.length > 0
      ? Math.round(
          jobs.reduce((sum, job) => sum + job.progress, 0) / jobs.length
        )
      : 0;

  // Update job priority
  const updatePriority = (id, priority) => {
    setJobs(
      jobs.map((job) =>
        job.id === id ? { ...job, priority: parseInt(priority, 10) } : job
      )
    );
  };

  // Update job deadline
  const updateDeadline = (id, deadline) => {
    setJobs(
      jobs.map((job) =>
        job.id === id ? { ...job, deadline } : job
      )
    );
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    return (
      (filter.status ? job.status === filter.status : true) &&
      (filter.priority ? job.priority === parseInt(filter.priority, 10) : true)
    );
  });

  // Delete job with confirmation
  const deleteJob = (id) => {
    const job = jobs.find((job) => job.id === id);
    if (window.confirm(`Are you sure you want to remove the job: "${job.title}"?`)) {
      setJobs(jobs.filter((job) => job.id !== id));
    }
  };

  // Priority labels with emojis
  const priorityLabels = {
    1: "🧘🏻‍♀️",
    2: "🚨",
  };

  // Function to handle CSV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log(results.data); // Log the parsed data to verify
          const newJobs = results.data.map((job, index) => ({
            title: job.title,
            org: job.organization,
            url: job.link,
            id: jobs.length + index + 1,
            status: "Not Started",
            priority: 1,
            deadline: new Date().toISOString().split('T')[0],
            progress: 0,
          }));
          setJobs([...jobs, ...newJobs]);
        },
      });
    }
  };

  // Load jobs from localStorage on component mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('jobs');
    if (savedJobs) {
      console.log('Loading jobs from localStorage:', JSON.parse(savedJobs));
      setJobs(JSON.parse(savedJobs));
    }
  }, []);

  // Save jobs to localStorage whenever jobs state changes
  useEffect(() => {
    console.log('Saving jobs to localStorage:', jobs);
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

  // Function to clear all jobs
  const clearAllJobs = () => {
    if (window.confirm("Are you sure you want to clear all jobs?")) {
      setJobs([]);
      localStorage.removeItem('jobs');
    }
  };

  return (
    <div className="app-container">
      {showCelebration && (
        <div className="celebration">
          <div className="celebration-emoji">🎉 🎊 🎉</div>
        </div>
      )}

      <div className="header-card">
        <div className="header-content">
          <div className="header-title">
            <h1>Job Application Progress Tracker</h1>
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-header">
              <h3>📊 Total Applications</h3>
            </div>
            <p className="stat-value">{filteredJobs.length}</p>
            <p className="stat-label">jobs to apply for</p>
            <p className="stat-label">
              <strong>Estimated Time:</strong> {filteredEstimatedHours} hours, {filteredEstimatedMinutes} minutes
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3>✅ Completed</h3>
            </div>
            <p className="stat-value">{completedCount}</p>
            <p className="stat-label">applications finished</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3>📈 Overall Progress</h3>
            </div>
            <div className="progress-container">
              <p className="stat-value">{overallProgress}%</p>
              <div className="progress-bar-background">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
            <p className="stat-label">toward completion</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3>🎁 Select Reward</h3>
            </div>
            <select
              value={selectedReward}
              onChange={(e) => setSelectedReward(e.target.value)}
              className="reward-dropdown"
            >
              {rewards.map((reward) => (
                <option key={reward} value={reward}>
                  {reward}
                </option>
              ))}
            </select>
            <p className="stat-label">for completing your applications</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3>💼 Job Boards</h3>
            </div>
            <ul className="job-board-links">
              <li>
                <a href="https://www.linkedin.com/jobs/" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://www.idealist.org/" target="_blank" rel="noopener noreferrer">
                  Idealist
                </a>
              </li>
              <li>
                <a href="https://www.builtin.com/jobs" target="_blank" rel="noopener noreferrer">
                  Built In
                </a>
              </li>
            </ul>
          </div>

          <div className="stat-card">
            <div className="stat-header">
<<<<<<< HEAD
              <h3>⏰ Application Timer</h3>
=======
              <h3>⏰Application Timer</h3>
>>>>>>> 143f91e1f157f254c2399670fc1ff0696b9fbeab
            </div>
            <p className="timer-display">
              {Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}
            </p>
            <div className="timer-controls">
              <button onClick={startTimer}><Play /></button>
              <button onClick={pauseTimer}><Pause /></button>
              <button onClick={stopTimer}><StopCircle /></button>
            </div>
            <p className="stat-label">time spent applying</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="filter-container">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="filter-dropdown"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="filter-dropdown"
          >
            <option value="">All Priorities</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Job</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Progress</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id} className="job-row">
                <td className="priority-cell">
                  <select
                    value={job.priority}
                    onChange={(e) => updatePriority(job.id, e.target.value)}
                    className="priority-dropdown"
                  >
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="job-info-cell">
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="job-title">
                    {job.title}
                  </a>
                </td>
                <td className="org-cell">{job.org}</td>
                <td className="status-cell">
                  <select
                    value={job.status}
                    onChange={(e) => updateStatus(job.id, e.target.value)}
                    className={getStatusColor(job.status)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="deadline-cell">
                  <input
                    type="date"
                    value={job.deadline}
                    onChange={(e) => updateDeadline(job.id, e.target.value)}
                  />
                </td>
                <td className="progress-cell">
                  <div className="job-progress">
                    <div className="job-progress-bar-bg">
                      <div
                        className="job-progress-bar-fill"
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                    <span className="job-progress-text">{job.progress}%</span>
                  </div>
                </td>
                <td className="action-cell">
                  <button onClick={() => deleteJob(job.id)} className="delete-button">X</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grid Section for Add Job, Import CSV, and CSV Explanation */}
      <div className="grid-container">
        <div className="grid-item">
          <h3>Add New Job</h3>
          <input
            type="text"
            className="stacked-input"
            placeholder="Job Title"
            value={newJob.title}
            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
          />
          <input
            type="text"
            className="stacked-input"
            placeholder="Organization"
            value={newJob.org}
            onChange={(e) => setNewJob({ ...newJob, org: e.target.value })}
          />
          <input
            type="text"
            className="stacked-input"
            placeholder="Job Link"
            value={newJob.url}
            onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
          />
          <button onClick={addNewJob} className="button">Add Job</button>
          <br></br>
          <button onClick={clearAllJobs} className="button clear-all-button">
            Clear All Jobs
          </button>
        </div>

        <div className="grid-item">
          <h3>Import Jobs from CSV</h3>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
          <br></br>
          <div className="csv-explanation">
            <p>To import jobs from a CSV file, ensure your file has the following columns:</p>
            <ul className="indented-list">
                <li><strong>title</strong>: The job title</li>
                <li><strong>organization</strong>: The name of the organization</li>
                <li><strong>link</strong>: The URL to the job listing</li>
            </ul>
            <p>Example CSV content:</p>
            <pre>
              title,organization,link
            </pre>
          </div>
        </div>
      </div>

      {/* Motivation System Section */}
      <div className="motivation-section">
        <div className="motivation-header">
          <h2>Motivation System</h2>
        </div>
        <div className="motivation-content">
          <ul className="motivation-list">
            <li className="motivation-item">
              <div className="motivation-icon-container">
                <Calendar className="motivation-icon" />
              </div>
              <div className="motivation-text">
                <span className="motivation-title">Deadline System:</span>
                <p>
                  Each job has a suggested deadline to keep you motivated and on
                  track. Jobs are spread over the next two weeks with earlier
                  deadlines for higher-priority positions.
                </p>
              </div>
            </li>
            <li className="motivation-item">
              <div className="motivation-icon-container">
                <Award className="motivation-icon" />
              </div>
              <div className="motivation-text">
                <span className="motivation-title">Reward System:</span>
                <p>
                  For every 3 completed applications, treat yourself to the
                  selected reward! This helps maintain momentum and celebrates
                  your hard work.
                </p>
              </div>
            </li>
            <li className="motivation-item">
              <div className="motivation-icon-container">
                <Target className="motivation-icon" />
              </div>
              <div className="motivation-text">
                <span className="motivation-title">Progress Tracking:</span>
                <p>
                  Breaking down each application into steps (resume, cover
                  letter, submission) makes the process less overwhelming and
                  shows your incremental progress.
                </p>
              </div>
            </li>
            <li className="motivation-item">
              <div className="motivation-icon-container">
                <CheckCircle className="motivation-icon" />
              </div>
              <div className="motivation-text">
                <span className="motivation-title">Celebration:</span>
                <p>
                  Enjoy a celebration animation whenever you complete an
                  application! Visual rewards reinforce your accomplishments.
                </p>
              </div>
            </li>
          </ul>
          <div className="pro-tips">
            <p className="pro-tips-header">Pro Tips:</p>
            <ul className="pro-tips-list">
              <li>
                Start with high-priority applications that have the earliest
                deadlines
              </li>
              <li>
                Block out 1-2 hours each day dedicated solely to applications
              </li>
              <li>
                Complete at least 2-3 applications per day to stay on track
              </li>
              <li>
                Research the organization for 15 minutes before starting each
                application
              </li>
              <li>
                Keep a document with reusable paragraphs for similar positions
              </li>
            </ul>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default JobApplicationTracker;
