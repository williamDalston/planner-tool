import './index.css';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CheckCircle, Clock, ArrowRight, Upload, Zap, Shield, Database, Cloud, Users, TrendingUp, Play, FileText, Mic, Video,
  Edit3, Plus, Save, X, Trash2, Eye, Palette, Layout, Settings, Calendar, Target, Lightbulb
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where } from 'firebase/firestore';

const ProjectDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null); // Will be set after data loads
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firebase state
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Global variables provided by the Canvas environment
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  // Initialize Firebase and handle authentication
  useEffect(() => {
    if (!firebaseConfig) {
      // Demo mode - skip Firebase initialization
      setLoading(false);
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const firestoreInstance = getFirestore(app);

      setAuth(authInstance);
      setDb(firestoreInstance);

      // Listen for auth state changes
      const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          // If no user, try to sign in with custom token or anonymously
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(authInstance, initialAuthToken);
            } else {
              await signInAnonymously(authInstance);
            }
          } catch (e) {
            console.error("Firebase Auth Error:", e);
            setError("Failed to authenticate. Please try again.");
          }
        }
        setIsAuthReady(true); // Auth state is ready, whether logged in or not
      });

      return () => unsubscribeAuth(); // Cleanup auth listener
    } catch (e) {
      console.error("Firebase Initialization Error:", e);
      setError("Failed to initialize Firebase. Check your configuration.");
      setLoading(false);
    }
  }, []);

  // Fetch projects from Firestore once auth is ready
  useEffect(() => {
    if (!firebaseConfig) {
      // Demo mode - use local data
      const demoProject = {
        id: 'demo-project',
        name: 'ClipGenius 2025',
        description: 'Empower anyone — even without video — to create stunning short-form content using just a spark of text or raw footage.',
        icon: '🧠',
        color: 'from-purple-500 to-blue-500',
        features: [
          { id: 1, name: 'Tailwind + Global Styling', status: 'done', files: 'index.css, tailwind.config.js, theme.css', category: 'Frontend' },
          { id: 2, name: 'Upload from file', status: 'done', files: 'UploadForm.tsx, upload.ts, UploadAPI.ts', category: 'Core' },
          { id: 3, name: 'Transcribe + Highlight AI Pipeline', status: 'progress', files: 'backend/cli.ts, placeholder logic done', category: 'AI/ML' },
          { id: 4, name: 'Upload to Cloudinary', status: 'done', files: 'uploadToCloudinary.ts', category: 'Infrastructure' },
          { id: 5, name: 'Job Status System', status: 'done', files: 'api/status/[fileId].ts', category: 'Backend' },
          { id: 6, name: 'Video Processing Backend', status: 'progress', files: 'backend/cli.ts', category: 'Backend' },
          { id: 7, name: 'Authentication', status: 'done', files: 'Clerk integrated, not gated yet', category: 'Auth' },
          { id: 8, name: 'Creator Mode UI', status: 'done', files: 'pages/creator.tsx', category: 'UI/UX' },
          { id: 9, name: 'Creator API', status: 'done', files: 'api/generate-clip-from-text.ts', category: 'API' },
          { id: 10, name: 'Creator Flow Logic', status: 'progress', files: 'UploadAPI.ts, /processing/:fileId', category: 'Core' },
          { id: 11, name: 'Firestore Integration', status: 'next', files: 'database/, metadata saving', category: 'Database' },
          { id: 12, name: 'Background Worker Deployment', status: 'next', files: 'Cloud Run job runner or Docker VM', category: 'Infrastructure' },
          { id: 13, name: 'Clip Download UI', status: 'progress', files: 'ProcessingScreen.tsx, downloadClip()', category: 'UI/UX' }
        ],
        uiuxTasks: [
          { id: 1, name: 'Landing Page Design', status: 'done', description: 'Hero section, features showcase, pricing', priority: 'high' },
          { id: 2, name: 'Upload Flow UX', status: 'done', description: 'Drag & drop, progress indicators, error states', priority: 'high' },
          { id: 3, name: 'Creator Mode Interface', status: 'progress', description: 'Text input, style selection, preview', priority: 'high' },
          { id: 4, name: 'Processing Status UI', status: 'progress', description: 'Real-time updates, estimated time, cancel option', priority: 'medium' },
          { id: 5, name: 'Clip Gallery & Management', status: 'next', description: 'Grid view, search, filters, sharing options', priority: 'medium' },
          { id: 6, name: 'Mobile Responsive Design', status: 'next', description: 'Touch-optimized, portrait video handling', priority: 'high' },
          { id: 7, name: 'Dark/Light Theme Toggle', status: 'next', description: 'Theme persistence, smooth transitions', priority: 'low' },
          { id: 8, name: 'Onboarding Flow', status: 'next', description: 'Tutorial tooltips, sample projects', priority: 'medium' }
        ],
        phases: [
          {
            id: 1,
            name: 'Phase 1 - MVP + Creator Alpha',
            timeline: 'This Week',
            color: 'bg-green-100 border-green-300',
            tasks: [
              'Tailwind + Upload + Status System',
              'Creator UI',
              'Serverless function stubs',
              'Wire up Firestore (auth + user uploads)',
              'Integrate Clerk with gated routes',
              'Implement FFmpeg + TTS placeholder backend logic'
            ]
          },
          {
            id: 2,
            name: 'Phase 2 - Full Creator Launch',
            timeline: 'Next Week',
            color: 'bg-blue-100 border-blue-300',
            tasks: [
              'Add real voice synthesis (PlayHT, Coqui)',
              'Add visuals (Pixabay API, animation)',
              'Merge with FFmpeg',
              'Queue system with real jobs',
              'Firestore save of clips',
              'Creator analytics, re-download, regenerate'
            ]
          },
          {
            id: 3,
            name: 'Phase 3 - Monetization & Growth',
            timeline: 'Mid-August',
            color: 'bg-purple-100 border-purple-300',
            tasks: [
              'Freemium limits (e.g., 5 clips/month)',
              'Stripe integration',
              'Share to TikTok, YouTube Shorts, IG Reels',
              'AI Templates (motivational, sales pitch, explainer)'
            ]
          }
        ],
        techStack: [
          { id: 1, category: 'Frontend', tech: 'Vite + React 19 + Tailwind CSS + Zustand + React Router', icon: 'FileText' },
          { id: 2, category: 'Authentication', tech: 'Clerk (frontend + serverless verification)', icon: 'Shield' },
          { id: 3, category: 'File Uploads', tech: 'Cloudinary (via uploadToCloudinary.ts)', icon: 'Upload' },
          { id: 4, category: 'Database', tech: 'Firestore (user clip metadata, status, auth-linked content)', icon: 'Database' },
          { id: 5, category: 'Serverless API', tech: 'Vercel Serverless Functions', icon: 'Zap' },
          { id: 6, category: 'Heavy Processing', tech: 'backend/cli.ts executed as Cloud Run Job OR Node.js worker on VM', icon: 'Cloud' },
          { id: 7, category: 'Job Queue', tech: 'BullMQ (Redis), or Cloud Pub/Sub, or in-memory dev mode', icon: 'Clock' },
          { id: 8, category: 'Storage/CDN', tech: 'Cloudinary for generated clips', icon: 'Video' }
        ]
      };
      
      setProjects([demoProject]);
      setCurrentProjectId('demo-project');
      setLoading(false);
      return;
    }

    if (!isAuthReady || !db || !userId) {
      return; // Wait for Firebase and auth to be ready
    }

    setLoading(true);
    setError(null);

    // Define the collection path for user-specific projects
    const projectsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/projects`);

    // Set up real-time listener for projects
    const unsubscribe = onSnapshot(projectsCollectionRef, (snapshot) => {
      const fetchedProjects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Initial ClipGenius data if no projects exist for the user
      const initialClipGeniusProject = {
        name: 'ClipGenius 2025',
        description: 'Empower anyone — even without video — to create stunning short-form content using just a spark of text or raw footage.',
        icon: '🧠',
        color: 'from-purple-500 to-blue-500',
        features: [
          { id: 1, name: 'Tailwind + Global Styling', status: 'done', files: 'index.css, tailwind.config.js, theme.css', category: 'Frontend' },
          { id: 2, name: 'Upload from file', status: 'done', files: 'UploadForm.tsx, upload.ts, UploadAPI.ts', category: 'Core' },
          { id: 3, name: 'Transcribe + Highlight AI Pipeline', status: 'progress', files: 'backend/cli.ts, placeholder logic done', category: 'AI/ML' },
          { id: 4, name: 'Upload to Cloudinary', status: 'done', files: 'uploadToCloudinary.ts', category: 'Infrastructure' },
          { id: 5, name: 'Job Status System', status: 'done', files: 'api/status/[fileId].ts', category: 'Backend' },
          { id: 6, name: 'Video Processing Backend', status: 'progress', files: 'backend/cli.ts', category: 'Backend' },
          { id: 7, name: 'Authentication', status: 'done', files: 'Clerk integrated, not gated yet', category: 'Auth' },
          { id: 8, name: 'Creator Mode UI', status: 'done', files: 'pages/creator.tsx', category: 'UI/UX' },
          { id: 9, name: 'Creator API', status: 'done', files: 'api/generate-clip-from-text.ts', category: 'API' },
          { id: 10, name: 'Creator Flow Logic', status: 'progress', files: 'UploadAPI.ts, /processing/:fileId', category: 'Core' },
          { id: 11, name: 'Firestore Integration', status: 'next', files: 'database/, metadata saving', category: 'Database' },
          { id: 12, name: 'Background Worker Deployment', status: 'next', files: 'Cloud Run job runner or Docker VM', category: 'Infrastructure' },
          { id: 13, name: 'Clip Download UI', status: 'progress', files: 'ProcessingScreen.tsx, downloadClip()', category: 'UI/UX' }
        ],
        uiuxTasks: [
          { id: 1, name: 'Landing Page Design', status: 'done', description: 'Hero section, features showcase, pricing', priority: 'high' },
          { id: 2, name: 'Upload Flow UX', status: 'done', description: 'Drag & drop, progress indicators, error states', priority: 'high' },
          { id: 3, name: 'Creator Mode Interface', status: 'progress', description: 'Text input, style selection, preview', priority: 'high' },
          { id: 4, name: 'Processing Status UI', status: 'progress', description: 'Real-time updates, estimated time, cancel option', priority: 'medium' },
          { id: 5, name: 'Clip Gallery & Management', status: 'next', description: 'Grid view, search, filters, sharing options', priority: 'medium' },
          { id: 6, name: 'Mobile Responsive Design', status: 'next', description: 'Touch-optimized, portrait video handling', priority: 'high' },
          { id: 7, name: 'Dark/Light Theme Toggle', status: 'next', description: 'Theme persistence, smooth transitions', priority: 'low' },
          { id: 8, name: 'Onboarding Flow', status: 'next', description: 'Tutorial tooltips, sample projects', priority: 'medium' }
        ],
        phases: [
          {
            id: 1,
            name: 'Phase 1 - MVP + Creator Alpha',
            timeline: 'This Week',
            color: 'bg-green-100 border-green-300',
            tasks: [
              'Tailwind + Upload + Status System',
              'Creator UI',
              'Serverless function stubs',
              'Wire up Firestore (auth + user uploads)',
              'Integrate Clerk with gated routes',
              'Implement FFmpeg + TTS placeholder backend logic'
            ]
          },
          {
            id: 2,
            name: 'Phase 2 - Full Creator Launch',
            timeline: 'Next Week',
            color: 'bg-blue-100 border-blue-300',
            tasks: [
              'Add real voice synthesis (PlayHT, Coqui)',
              'Add visuals (Pixabay API, animation)',
              'Merge with FFmpeg',
              'Queue system with real jobs',
              'Firestore save of clips',
              'Creator analytics, re-download, regenerate'
            ]
          },
          {
            id: 3,
            name: 'Phase 3 - Monetization & Growth',
            timeline: 'Mid-August',
            color: 'bg-purple-100 border-purple-300',
            tasks: [
              'Freemium limits (e.g., 5 clips/month)',
              'Stripe integration',
              'Share to TikTok, YouTube Shorts, IG Reels',
              'AI Templates (motivational, sales pitch, explainer)'
            ]
          }
        ],
        techStack: [
          { id: 1, category: 'Frontend', tech: 'Vite + React 19 + Tailwind CSS + Zustand + React Router', icon: 'FileText' },
          { id: 2, category: 'Authentication', tech: 'Clerk (frontend + serverless verification)', icon: 'Shield' },
          { id: 3, category: 'File Uploads', tech: 'Cloudinary (via uploadToCloudinary.ts)', icon: 'Upload' },
          { id: 4, category: 'Database', tech: 'Firestore (user clip metadata, status, auth-linked content)', icon: 'Database' },
          { id: 5, category: 'Serverless API', tech: 'Vercel Serverless Functions', icon: 'Zap' },
          { id: 6, category: 'Heavy Processing', tech: 'backend/cli.ts executed as Cloud Run Job OR Node.js worker on VM', icon: 'Cloud' },
          { id: 7, category: 'Job Queue', tech: 'BullMQ (Redis), or Cloud Pub/Sub, or in-memory dev mode', icon: 'Clock' },
          { id: 8, category: 'Storage/CDN', tech: 'Cloudinary for generated clips', icon: 'Video' }
        ]
      };

      if (fetchedProjects.length === 0) {
        // If no projects, add the initial ClipGenius project to Firestore
        addDoc(projectsCollectionRef, initialClipGeniusProject)
          .then((docRef) => {
            setProjects([{ id: docRef.id, ...initialClipGeniusProject }]);
            setCurrentProjectId(docRef.id);
          })
          .catch((e) => {
            console.error("Error adding initial project:", e);
            setError("Failed to add initial project.");
          });
      } else {
        setProjects(fetchedProjects);
        // Set current project to the first one or keep existing if it's still there
        if (currentProjectId && fetchedProjects.some(p => p.id === currentProjectId)) {
          setCurrentProjectId(currentProjectId);
        } else if (fetchedProjects.length > 0) {
          setCurrentProjectId(fetchedProjects[0].id);
        }
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore Snapshot Error:", err);
      setError("Failed to load projects. Please check your network connection.");
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup Firestore listener
  }, [isAuthReady, db, userId, appId]); // Re-run effect when auth/db/userId changes

  const currentProject = projects.find(p => p.id === currentProjectId);

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'next':
        return <ArrowRight className="w-5 h-5 text-blue-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      FileText, Shield, Upload, Database, Zap, Cloud, Clock, Video, Users,
      TrendingUp, Play, Mic, Settings, Calendar, Target, Lightbulb, Palette, Layout
    };
    const IconComponent = icons[iconName] || FileText;
    return <IconComponent className="w-6 h-6" />;
  };

  const addNewProject = async () => {
    if (!firebaseConfig) {
      // Demo mode - add to local state
      const newProjectData = {
        id: `demo-${Date.now()}`,
        name: 'New Project',
        description: 'Project description',
        icon: '🚀',
        color: 'from-blue-500 to-purple-500',
        features: [],
        uiuxTasks: [],
        phases: [],
        techStack: []
      };
      setProjects([...projects, newProjectData]);
      setCurrentProjectId(newProjectData.id);
      setEditMode(true);
      return;
    }

    if (!db || !userId) return;
    setLoading(true);
    setError(null);
    const newProjectData = {
      name: 'New Project',
      description: 'Project description',
      icon: '🚀',
      color: 'from-blue-500 to-purple-500',
      features: [],
      uiuxTasks: [],
      phases: [],
      techStack: []
    };
    try {
      const docRef = await addDoc(collection(db, `artifacts/${appId}/users/${userId}/projects`), newProjectData);
      setCurrentProjectId(docRef.id);
      setEditMode(true);
    } catch (e) {
      console.error("Error adding document: ", e);
      setError("Failed to add new project.");
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (updatedProject) => {
    if (!firebaseConfig) {
      // Demo mode - update local state
      const updatedProjects = projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      );
      setProjects(updatedProjects);
      return;
    }

    if (!db || !userId || !updatedProject.id) return;
    setLoading(true);
    setError(null);
    try {
      // Use setDoc to replace the entire document with updated data
      await setDoc(doc(db, `artifacts/${appId}/users/${userId}/projects`, updatedProject.id), updatedProject);
    } catch (e) {
      console.error("Error updating document: ", e);
      setError("Failed to update project.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (!firebaseConfig) {
      // Demo mode - update local state
      if (projects.length <= 1) return; // Prevent deleting the last project
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      if (currentProjectId === projectId) {
        setCurrentProjectId(updatedProjects[0]?.id || null);
      }
      return;
    }

    if (!db || !userId || projects.length <= 1) return; // Prevent deleting the last project
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/projects`, projectId));
      if (currentProjectId === projectId) {
        // After deletion, switch to the first remaining project
        setCurrentProjectId(projects.filter(p => p.id !== projectId)[0]?.id || null);
      }
    } catch (e) {
      console.error("Error deleting document: ", e);
      setError("Failed to delete project.");
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (!currentProject) return;
    const newFeature = {
      id: Date.now(), // Use Date.now() for unique client-side IDs before saving
      name: 'New Feature',
      status: 'next',
      files: 'files/paths',
      category: 'Core'
    };
    updateProject({
      ...currentProject,
      features: [...(currentProject.features || []), newFeature]
    });
  };

  const addUIUXTask = () => {
    if (!currentProject) return;
    const newTask = {
      id: Date.now(),
      name: 'New UI/UX Task',
      status: 'next',
      description: 'Task description',
      priority: 'medium'
    };
    updateProject({
      ...currentProject,
      uiuxTasks: [...(currentProject.uiuxTasks || []), newTask]
    });
  };

  const addPhase = () => {
    if (!currentProject) return;
    const newPhase = {
      id: Date.now(),
      name: 'New Phase',
      timeline: 'Timeline',
      color: 'bg-gray-100 border-gray-300',
      tasks: []
    };
    updateProject({
      ...currentProject,
      phases: [...(currentProject.phases || []), newPhase]
    });
  };

  const addTechStackItem = () => {
    if (!currentProject) return;
    const newTech = {
      id: Date.now(),
      category: 'New Category',
      tech: 'Technology description',
      icon: 'Settings'
    };
    updateProject({
      ...currentProject,
      techStack: [...(currentProject.techStack || []), newTech]
    });
  };

  const EditableField = ({ value, onChange, className = "", multiline = false, placeholder = "" }) => {
    if (!editMode) return <span className={className}>{value}</span>;

    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${className} bg-gray-700 text-white rounded px-2 py-1 resize-none`}
          placeholder={placeholder}
          rows={3}
        />
      );
    }

    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} bg-gray-700 text-white rounded px-2 py-1`}
        placeholder={placeholder}
      />
    );
  };

  const EditableSelect = ({ value, onChange, options, className = "" }) => {
    if (!editMode) return <span className={className}>{value}</span>;

    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} bg-gray-700 text-white rounded px-2 py-1`}
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center">
        <div className="text-2xl font-bold flex items-center gap-3">
          <Clock className="animate-spin" /> Loading your projects...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center">
        <div className="text-xl">No projects found. Try adding a new one!</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* User ID Display */}
        {userId && (
          <div className="text-right text-xs text-gray-400 mb-4">
            User ID: {userId}
          </div>
        )}

        {/* Header with Project Selector */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <select
              value={currentProjectId || ''} // Ensure value is not null for select
              onChange={(e) => setCurrentProjectId(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.icon} {project.name}
                </option>
              ))}
            </select>
            <button
              onClick={addNewProject}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          <div className="flex items-center gap-3">
            {projects.length > 1 && (
              <button
                onClick={() => deleteProject(currentProjectId)}
                className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {editMode ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {editMode ? 'Save' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Project Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${currentProject.color} rounded-xl flex items-center justify-center text-2xl`}>
              {editMode ? (
                <input
                  value={currentProject.icon}
                  onChange={(e) => updateProject({...currentProject, icon: e.target.value})}
                  className="w-8 h-8 bg-transparent text-center text-2xl"
                  maxLength={2}
                />
              ) : (
                currentProject.icon
              )}
            </div>
            <EditableField
              value={currentProject.name}
              onChange={(value) => updateProject({...currentProject, name: value})}
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
              placeholder="Project Name"
            />
          </div>
          <EditableField
            value={currentProject.description}
            onChange={(value) => updateProject({...currentProject, description: value})}
            className="text-xl text-gray-300 max-w-4xl mx-auto"
            multiline={true}
            placeholder="Project description"
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700 flex flex-wrap">
            {['overview', 'features', 'uiux', 'roadmap', 'architecture'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab === 'uiux' ? 'UI/UX' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Progress Overview */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
                Development Progress
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Features Complete</span>
                  <span className="text-2xl font-bold text-green-400">
                    {(currentProject.features || []).filter(f => f.status === 'done').length}/{(currentProject.features || []).length}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                     className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-1000"
                    style={{
                       width: currentProject.features?.length > 0
                         ? `${((currentProject.features || []).filter(f => f.status === 'done').length / (currentProject.features || []).length) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{(currentProject.features || []).filter(f => f.status === 'done').length}</div>
                    <div className="text-sm text-gray-400">Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{(currentProject.features || []).filter(f => f.status === 'progress').length}</div>
                    <div className="text-sm text-gray-400">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{(currentProject.features || []).filter(f => f.status === 'next').length}</div>
                    <div className="text-sm text-gray-400">Next</div>
                  </div>
                </div>
              </div>
            </div>

            {/* UI/UX Progress */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Palette className="w-6 h-6 text-purple-400" />
                UI/UX Progress
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Tasks Complete</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {(currentProject.uiuxTasks || []).filter(f => f.status === 'done').length}/{(currentProject.uiuxTasks || []).length}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                     className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-1000"
                    style={{
                       width: currentProject.uiuxTasks?.length > 0
                         ? `${((currentProject.uiuxTasks || []).filter(f => f.status === 'done').length / (currentProject.uiuxTasks || []).length) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
                <div className="space-y-2 mt-4">
                  {['high', 'medium', 'low'].map(priority => (
                    <div key={priority} className="flex items-center justify-between text-sm">
                      <span className={`capitalize ${priority === 'high' ? 'text-red-400' : priority === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {priority} Priority
                      </span>
                      <span className="text-gray-300">
                        {(currentProject.uiuxTasks || []).filter(t => t.priority === priority).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phase Progress */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-400" />
                Phase Overview
              </h2>
              <div className="space-y-4">
                {(currentProject.phases || []).map((phase, idx) => (
                  <div key={phase.id} className="p-4 bg-gray-700/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm">{phase.name}</h3>
                      <span className="text-xs text-gray-400">{phase.timeline}</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      {phase.tasks?.length || 0} tasks
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Development Features</h2>
              {editMode && (
                <button
                  onClick={addFeature}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              )}
            </div>
            <div className="grid gap-4">
              {(currentProject.features || []).map((feature, idx) => (
                <div key={feature.id} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600">
                  <StatusIcon status={feature.status} />
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <EditableField
                        value={feature.name}
                        onChange={(value) => {
                          const updated = currentProject.features.map(f =>
                             f.id === feature.id ? {...f, name: value} : f
                          );
                          updateProject({...currentProject, features: updated});
                        }}
                        className="font-semibold text-white"
                        placeholder="Feature name"
                      />
                      <EditableSelect
                        value={feature.category}
                        onChange={(value) => {
                          const updated = currentProject.features.map(f =>
                             f.id === feature.id ? {...f, category: value} : f
                          );
                          updateProject({...currentProject, features: updated});
                        }}
                        options={['Frontend', 'Backend', 'UI/UX', 'API', 'Database', 'Auth', 'Infrastructure', 'Core', 'AI/ML']}
                        className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded"
                      />
                    </div>
                    <EditableField
                      value={feature.files}
                      onChange={(value) => {
                        const updated = currentProject.features.map(f =>
                           f.id === feature.id ? {...f, files: value} : f
                        );
                        updateProject({...currentProject, features: updated});
                      }}
                      className="text-sm text-gray-400"
                      placeholder="File paths or description"
                    />
                  </div>
                  <EditableSelect
                    value={feature.status}
                    onChange={(value) => {
                      const updated = currentProject.features.map(f =>
                         f.id === feature.id ? {...f, status: value} : f
                      );
                      updateProject({...currentProject, features: updated});
                    }}
                    options={['done', 'progress', 'next']}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-200"
                  />
                  {editMode && (
                    <button
                      onClick={() => {
                        const updated = currentProject.features.filter(f => f.id !== feature.id);
                        updateProject({...currentProject, features: updated});
                      }}
                      className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'uiux' && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Palette className="w-6 h-6 text-purple-400" />
                UI/UX Tasks
              </h2>
              {editMode && (
                <button
                  onClick={addUIUXTask}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add UI/UX Task
                </button>
              )}
            </div>
            <div className="grid gap-4">
              {(currentProject.uiuxTasks || []).map((task, idx) => (
                <div key={task.id} className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600">
                  <StatusIcon status={task.status} />
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <EditableField
                        value={task.name}
                        onChange={(value) => {
                          const updated = currentProject.uiuxTasks.map(t =>
                             t.id === task.id ? {...t, name: value} : t
                          );
                          updateProject({...currentProject, uiuxTasks: updated});
                        }}
                        className="font-semibold text-white"
                        placeholder="Task name"
                      />
                      <EditableSelect
                        value={task.priority}
                        onChange={(value) => {
                          const updated = currentProject.uiuxTasks.map(t =>
                             t.id === task.id ? {...t, priority: value} : t
                          );
                          updateProject({...currentProject, uiuxTasks: updated});
                        }}
                        options={['high', 'medium', 'low']}
                        className={`text-xs px-2 py-1 rounded ${
                          task.priority === 'high' ? 'bg-red-900/30 text-red-300' :
                          task.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
                          'bg-green-900/30 text-green-300'
                        }`}
                      />
                    </div>
                    <EditableField
                      value={task.description}
                      onChange={(value) => {
                        const updated = currentProject.uiuxTasks.map(t =>
                           t.id === task.id ? {...t, description: value} : t
                        );
                        updateProject({...currentProject, uiuxTasks: updated});
                      }}
                      className="text-sm text-gray-400"
                      placeholder="Task description"
                    />
                  </div>
                  <EditableSelect
                    value={task.status}
                    onChange={(value) => {
                      const updated = currentProject.uiuxTasks.map(t =>
                         t.id === task.id ? {...t, status: value} : t
                      );
                      updateProject({...currentProject, uiuxTasks: updated});
                    }}
                    options={['done', 'progress', 'next']}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-200"
                  />
                  {editMode && (
                    <button
                      onClick={() => {
                        const updated = currentProject.uiuxTasks.filter(t => t.id !== task.id);
                        updateProject({...currentProject, uiuxTasks: updated});
                      }}
                      className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Project Roadmap</h2>
              {editMode && (
                <button
                  onClick={addPhase}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Phase
                </button>
              )}
            </div>
            {(currentProject.phases || []).map((phase, idx) => (
              <div key={phase.id} className={`border-2 rounded-2xl p-8 ${phase.color}`}>
                <div className="flex items-center justify-between mb-6">
                  <EditableField
                    value={phase.name}
                    onChange={(value) => {
                      const updated = currentProject.phases.map(p =>
                         p.id === phase.id ? {...p, name: value} : p
                      );
                      updateProject({...currentProject, phases: updated});
                    }}
                    className="text-2xl font-bold text-gray-800"
                    placeholder="Phase name"
                  />
                  <div className="flex items-center gap-3">
                    <EditableField
                      value={phase.timeline}
                      onChange={(value) => {
                        const updated = currentProject.phases.map(p =>
                           p.id === phase.id ? {...p, timeline: value} : p
                        );
                        updateProject({...currentProject, phases: updated});
                      }}
                      className="px-4 py-2 bg-white/50 rounded-full text-sm font-medium text-gray-700"
                      placeholder="Timeline"
                    />
                    {editMode && (
                      <button
                        onClick={() => {
                          const updated = currentProject.phases.filter(p => p.id !== phase.id);
                          updateProject({...currentProject, phases: updated});
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {(phase.tasks || []).map((task, taskIdx) => (
                    <div key={taskIdx} className="flex items-center gap-3 p-3 bg-white/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-gray-600" />
                      {editMode ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            value={task}
                            onChange={(e) => {
                              const updatedTasks = [...phase.tasks];
                              updatedTasks[taskIdx] = e.target.value;
                              const updated = currentProject.phases.map(p =>
                                 p.id === phase.id ? {...p, tasks: updatedTasks} : p
                              );
                              updateProject({...currentProject, phases: updated});
                            }}
                            className="flex-1 bg-white/50 text-gray-800 rounded px-2 py-1"
                          />
                          <button
                            onClick={() => {
                              const updatedTasks = phase.tasks.filter((_, i) => i !== taskIdx);
                              const updated = currentProject.phases.map(p =>
                                 p.id === phase.id ? {...p, tasks: updatedTasks} : p
                              );
                              updateProject({...currentProject, phases: updated});
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-800">{task}</span>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <button
                      onClick={() => {
                        const updatedTasks = [...(phase.tasks || []), 'New task'];
                        const updated = currentProject.phases.map(p =>
                           p.id === phase.id ? {...p, tasks: updatedTasks} : p
                        );
                        updateProject({...currentProject, phases: updated});
                      }}
                      className="flex items-center gap-3 p-3 bg-white/20 rounded-lg border-2 border-dashed border-gray-600 hover:bg-white/30 transition-all"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Add Task</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Tech Stack</h2>
                {editMode && (
                  <button
                    onClick={addTechStackItem}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tech
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {(currentProject.techStack || []).map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-xl">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                      {getIconComponent(item.icon)}
                    </div>
                    <div className="flex-1">
                      <EditableField
                        value={item.category}
                        onChange={(value) => {
                          const updated = currentProject.techStack.map(t =>
                             t.id === item.id ? {...t, category: value} : t
                          );
                          updateProject({...currentProject, techStack: updated});
                        }}
                        className="font-semibold text-white mb-1"
                        placeholder="Category"
                      />
                      <EditableField
                        value={item.tech}
                        onChange={(value) => {
                          const updated = currentProject.techStack.map(t =>
                             t.id === item.id ? {...t, tech: value} : t
                          );
                          updateProject({...currentProject, techStack: updated});
                        }}
                        className="text-sm text-gray-300"
                        placeholder="Technology description"
                      />
                    </div>
                    {editMode && (
                      <div className="flex flex-col gap-2">
                        <select
                          value={item.icon}
                          onChange={(e) => {
                            const updated = currentProject.techStack.map(t =>
                               t.id === item.id ? {...t, icon: e.target.value} : t
                            );
                            updateProject({...currentProject, techStack: updated});
                          }}
                          className="bg-gray-700 text-white rounded px-2 py-1 text-xs"
                        >
                          {['FileText', 'Shield', 'Upload', 'Database', 'Zap', 'Cloud', 'Clock', 'Video', 'Users', 'Settings', 'Calendar', 'Target', 'Lightbulb'].map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const updated = currentProject.techStack.filter(t => t.id !== item.id);
                            updateProject({...currentProject, techStack: updated});
                          }}
                          className="p-1 text-red-400 hover:bg-red-900/30 rounded transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6">Project Analytics</h2>
              <div className="space-y-6">
                <div className="p-4 bg-green-900/30 rounded-xl border border-green-700">
                  <h3 className="font-semibold text-green-400 mb-2">Completion Rate</h3>
                  <div className="text-2xl font-bold text-white">
                    {currentProject.features?.length > 0
                       ? Math.round(((currentProject.features || []).filter(f => f.status === 'done').length / (currentProject.features || []).length) * 100)
                      : 0}%
                  </div>
                  <p className="text-gray-300 text-sm">Development features completed</p>
                </div>
                <div className="p-4 bg-purple-900/30 rounded-xl border border-purple-700">
                  <h3 className="font-semibold text-purple-400 mb-2">UI/UX Progress</h3>
                  <div className="text-2xl font-bold text-white">
                    {currentProject.uiuxTasks?.length > 0
                       ? Math.round(((currentProject.uiuxTasks || []).filter(t => t.status === 'done').length / (currentProject.uiuxTasks || []).length) * 100)
                      : 0}%
                  </div>
                  <p className="text-gray-300 text-sm">Design tasks completed</p>
                </div>
                <div className="p-4 bg-blue-900/30 rounded-xl border border-blue-700">
                  <h3 className="font-semibold text-blue-400 mb-2">Active Phases</h3>
                  <div className="text-2xl font-bold text-white">{(currentProject.phases || []).length}</div>
                  <p className="text-gray-300 text-sm">Project phases defined</p>
                </div>
                <div className="p-4 bg-yellow-900/30 rounded-xl border border-yellow-700">
                  <h3 className="font-semibold text-yellow-400 mb-2">Tech Stack Size</h3>
                  <div className="text-2xl font-bold text-white">{(currentProject.techStack || []).length}</div>
                  <p className="text-gray-300 text-sm">Technologies in use</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;

// Mount the React app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<ProjectDashboard />);
