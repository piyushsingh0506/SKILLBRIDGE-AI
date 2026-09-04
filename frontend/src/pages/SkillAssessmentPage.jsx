import React, { useState, useEffect } from 'react';
import { assessmentService } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  Target, Clock, CheckCircle2, AlertCircle, Award, 
  ArrowRight, ArrowLeft, RefreshCw, Sparkles, Check, HelpCircle 
} from 'lucide-react';

const SkillAssessmentPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds

  useEffect(() => {
    loadAssessments();
    loadHistory();
  }, []);

  useEffect(() => {
    let timer;
    if (activeAssessment && !result && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activeAssessment, result, timeLeft]);

  const loadAssessments = async () => {
    try {
      const res = await assessmentService.listAssessments();
      setAssessments(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await assessmentService.getHistory();
      setHistory(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const startAssessment = async (assessment) => {
    try {
      const res = await assessmentService.getQuestions(assessment.id);
      setActiveAssessment(assessment);
      setQuestions(res.data.questions);
      setCurrentIdx(0);
      setAnswers({});
      setResult(null);
      setTimeLeft(assessment.duration_minutes * 60 || 1200);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectOption = (questionId, option) => {
    setAnswers({ ...answers, [String(questionId)]: option });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await assessmentService.submitAssessment({
        assessment_id: activeAssessment.id,
        answers: answers
      });
      setResult(res.data);
      if (res.data.score >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      loadHistory();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display">AI Skill Assessment Engine</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Verify your competencies through proctored AI quizzes to earn verified badges and boost your opportunity match scores
        </p>
      </div>

      {/* When NO assessment is active */}
      {!activeAssessment && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {a.category}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{a.duration_minutes} Mins</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition mb-1.5">
                    {a.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {a.description}
                  </p>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-3">
                    Questions: <strong className="text-white">{a.total_questions} MCQs</strong>
                  </div>
                  <button
                    onClick={() => startAssessment(a)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-1.5"
                  >
                    <span>Start Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Assessment History */}
          {history.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 mt-8">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Assessment History & Verified Badges</h2>
              <div className="divide-y divide-slate-800/80">
                {history.map((h) => (
                  <div key={h.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-2">
                        <span>{h.assessment_title}</span>
                        {h.score >= 70 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Completed on {new Date(h.completed_at).toLocaleDateString()} • {h.correct_answers}/{h.total_questions} Correct
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        h.score >= 75 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {h.score}% Score
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ACTIVE ASSESSMENT SCREEN */}
      {activeAssessment && !result && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl">
          
          {/* Quiz Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                {activeAssessment.category} MODULE
              </span>
              <h2 className="text-base font-bold text-white">{activeAssessment.title}</h2>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={() => setActiveAssessment(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Quit
              </button>
            </div>
          </div>

          {/* Question Index Progress */}
          <div className="my-6">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Completed</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question Body */}
          {currentQ && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  Tested Skill: {currentQ.skill_name} • {currentQ.difficulty}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {currentQ.question_text}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'A', text: currentQ.option_a },
                  { key: 'B', text: currentQ.option_b },
                  { key: 'C', text: currentQ.option_c },
                  { key: 'D', text: currentQ.option_d },
                ].map((opt) => {
                  const isSelected = answers[String(currentQ.id)] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.key)}
                      className={`p-4 rounded-xl text-left border transition-all duration-200 flex items-start space-x-3 ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 scale-[1.01]'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                        isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-xs font-medium leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 disabled:opacity-40 transition flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white transition flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{submitting ? 'Evaluating...' : 'Submit & Score Quiz'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* RESULT REPORT SCREEN */}
      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/40 bg-slate-900/95 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center">
            <Award className="w-8 h-8 text-emerald-400" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Assessment Complete</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              You Scored {result.score}%
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              {result.feedback}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto text-left">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <div className="text-[10px] text-slate-400 font-bold">Total Questions</div>
              <div className="text-base font-extrabold text-white">{result.total_questions}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <div className="text-[10px] text-slate-400 font-bold">Correct Answers</div>
              <div className="text-base font-extrabold text-emerald-400">{result.correct_answers}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <div className="text-[10px] text-slate-400 font-bold">Updated Skill Score</div>
              <div className="text-base font-extrabold text-indigo-400">{result.updated_overall_score}%</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <div className="text-[10px] text-slate-400 font-bold">Technical Badge</div>
              <div className="text-base font-extrabold text-cyan-400">{result.updated_technical_score}%</div>
            </div>
          </div>

          {/* Skill Performance Breakdown */}
          {result.category_breakdown && (
            <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left space-y-2">
              <div className="text-xs font-bold text-white mb-2">Skill Verification Breakdown</div>
              {Object.entries(result.category_breakdown).map(([skill, pct]) => (
                <div key={skill} className="flex justify-between text-xs">
                  <span className="text-slate-300">{skill}</span>
                  <span className="text-emerald-400 font-bold">{pct}%</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-center space-x-3">
            <button
              onClick={() => {
                setActiveAssessment(null);
                setResult(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20"
            >
              Back to Assessments
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default SkillAssessmentPage;
