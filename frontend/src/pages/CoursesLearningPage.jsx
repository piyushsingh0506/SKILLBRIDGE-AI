import React, { useState, useEffect } from 'react';
import { opportunityService } from '../services/api';
import { 
  BookOpen, Star, Clock, Award, ExternalLink, Search, Filter 
} from 'lucide-react';

const CoursesLearningPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await opportunityService.getCourses(search || undefined);
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory]);

  const filtered = courses.filter((c) => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display">Curated Learning Recommendations</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Bridge identified skill gaps with certified coursework from SWAYAM, NPTEL, Coursera, and AIIA Academy
        </p>
      </div>

      {/* Filter */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by course topic or mapped skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
            className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-xs font-semibold text-white bg-slate-900"
          >
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Domain/Ayush">Ayush & Clinical</option>
            <option value="Soft">Soft & Management</option>
          </select>
          <button
            onClick={fetchCourses}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading courses catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                    Bridges: {course.mapped_skill || 'Core Skill'}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition mb-1.5">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {course.description}
                </p>

                <div className="flex items-center space-x-4 text-xs text-slate-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{course.duration_hours} Hours</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                  {course.provider}
                </span>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white font-bold text-xs transition flex items-center space-x-1"
                >
                  <span>Enroll</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CoursesLearningPage;
