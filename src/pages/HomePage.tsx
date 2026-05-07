import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TabNav } from '@/components/features/TabNav';
import { SearchBar } from '@/components/features/SearchBar';
import { CourseCard } from '@/components/features/CourseCard';
import { RoadmapView } from '@/components/features/RoadmapView';
import { ChatDrawer } from '@/components/features/ChatDrawer';
import { ChatTrigger } from '@/components/features/ChatTrigger';
import { ChatHistory } from '@/components/features/ChatHistory';
import { SettingsModal } from '@/components/features/SettingsModal';
import { PopularTopics } from '@/components/features/PopularTopics';
import { FavoritesSection } from '@/components/features/FavoritesSection';
import { ExportButton } from '@/components/features/ExportButton';
import { LoadingSpinner } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCourseSearch, useRoadmap } from '@/hooks/useSearch';
import { useChat } from '@/hooks/useChat';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useFavorites } from '@/hooks/useFavorites';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useAISettings } from '@/context/AISettingsContext';
import { Course, ChatSession, ActiveTab } from '@/types';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  const { settings, updateSettings } = useAISettings();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const { courses, isLoading: isSearching, search, error: searchError } = useCourseSearch();
  const { roadmap, isLoading: isGenerating, generate, error: roadmapError } = useRoadmap();
  const { messages, sendMessage, isLoading: isChatLoading, clearMessages } = useChat();
  const {
    sessions,
    saveSession,
    deleteSession,
    clearAllSessions,
    isLoaded: isHistoryLoaded,
  } = useChatHistory();
  const { favorites, removeFavorite, isFavorite, toggleFavorite } = useFavorites();
  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    error: suggestionsError,
    getSuggestions,
  } = useSuggestions();

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) search(query.trim());
  };

  const handleTopicSelect = (topic: string) => {
    setQuery(topic);
    search(topic);
    setActiveTab('search');
  };

  const handleGenerateRoadmap = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) generate(query.trim());
  };

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleOpenChat = () => setIsChatOpen(true);

  const handleOpenHistory = () => {
    setIsChatHistoryOpen(true);
    setIsChatOpen(false);
  };

  const handleCloseChat = () => {
    if (messages.length > 0 && isHistoryLoaded) {
      const sessionId = saveSession(messages);
      if (sessionId && !currentSessionId) {
        setCurrentSessionId(sessionId);
      }
    }
    setIsChatOpen(false);
  };

  const handleSelectSession = (session: ChatSession) => {
    if (currentSessionId && messages.length > 0 && isHistoryLoaded) {
      saveSession(messages);
    }
    clearMessages();
    setCurrentSessionId(session.id);
    setIsChatHistoryOpen(false);
    setIsChatOpen(true);
  };

  const handleGetSuggestions = () => {
    getSuggestions(favorites);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full p-3 sm:p-4 space-y-3 sm:space-y-4">
        <TabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenChat={handleOpenChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Search/Roadmap Input */}
        {activeTab !== 'favorites' && (
          <div className="brutal-border flex items-center gap-4 bg-white shadow-brutal p-4 sm:p-6">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={activeTab === 'search' ? handleSearch : handleGenerateRoadmap}
              isLoading={isSearching || isGenerating}
              activeTab={activeTab}
              placeholder={
                activeTab === 'search'
                  ? 'Search for free courses...'
                  : 'Enter a topic for your learning roadmap...'
              }
            />
            {activeTab === 'roadmap' && !isGenerating && (
              <div className="flex justify-end shrink-0">
                <Button
                  size="sm"
                  className="md:w-46 md:h-16 flex items-center"
                  onClick={() => handleGenerateRoadmap()}
                  disabled={isGenerating}
                >
                  <Sparkles className="w-4 h-4 md:mr-2" />
                  <span className="md:block hidden">Generate Roadmap</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <>
            <PopularTopics onSelect={handleTopicSelect} disabled={isSearching || isGenerating} />

            <div className="space-y-4">
              {isSearching && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-brand-gray">Searching for courses...</p>
                </div>
              )}

              {searchError && (
                <div className="brutal-border border-red-500 bg-red-50 p-4">
                  <p className="text-red-600">{searchError}</p>
                </div>
              )}

              {!isSearching && courses.length > 0 && (
                <>
                  <p className="font-bold text-lg">Found {courses.length} free courses</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {courses.map((course, index) => (
                      <CourseCard
                        key={`${course.url}-${index}`}
                        course={course}
                        onClick={() => setSelectedCourse(course)}
                        isFavorite={isFavorite(course.url)}
                        onToggleFavorite={() => toggleFavorite(course)}
                      />
                    ))}
                  </div>
                </>
              )}

              {!isSearching && courses.length === 0 && !searchError && (
                <div className="text-center py-12 text-brand-gray">
                  <p>Search for courses to see results here.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <>
            <RoadmapView
              roadmap={roadmap}
              isLoading={isGenerating}
              error={roadmapError || undefined}
            />
            {roadmap && (
              <div className="flex justify-end">
                <ExportButton roadmap={roadmap} />
              </div>
            )}
          </>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <FavoritesSection
            favorites={favorites}
            onRemove={removeFavorite}
            suggestions={{
              courses: suggestions,
              isLoading: isSuggestionsLoading,
              error: suggestionsError,
              onGetSuggestions: handleGetSuggestions,
            }}
          />
        )}
      </main>

      <Footer />

      {/* Floating Chat Button */}
      <ChatTrigger onClick={handleOpenChat} />

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        onOpenHistory={handleOpenHistory}
        isLoading={isChatLoading}
      />

      {/* Chat History Modal */}
      <ChatHistory
        isOpen={isChatHistoryOpen}
        onClose={() => setIsChatHistoryOpen(false)}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onDeleteSession={deleteSession}
        onClearAll={clearAllSessions}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={updateSettings}
      />

      {/* Course Detail Modal */}
      {selectedCourse && (
        <Modal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={selectedCourse.title}
        >
          <div className="space-y-4">
            <div>
              <p className="font-bold text-brand-gray uppercase text-xs tracking-wide mb-1">
                Provider
              </p>
              <p className="text-lg">{selectedCourse.provider}</p>
            </div>
            <div>
              <p className="font-bold text-brand-gray uppercase text-xs tracking-wide mb-1">
                Description
              </p>
              <p>{selectedCourse.description}</p>
            </div>
            {selectedCourse.rating && (
              <div>
                <p className="font-bold text-brand-gray uppercase text-xs tracking-wide mb-1">
                  Rating
                </p>
                <p>{selectedCourse.rating}</p>
              </div>
            )}
            {selectedCourse.duration && (
              <div>
                <p className="font-bold text-brand-gray uppercase text-xs tracking-wide mb-1">
                  Duration
                </p>
                <p>{selectedCourse.duration}</p>
              </div>
            )}
            {selectedCourse.level && (
              <div>
                <p className="font-bold text-brand-gray uppercase text-xs tracking-wide mb-1">
                  Level
                </p>
                <p>{selectedCourse.level}</p>
              </div>
            )}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => toggleFavorite(selectedCourse)}
                className="flex-1 brutal-border py-2 font-bold text-sm hover:bg-brand-paper transition-colors"
              >
                {isFavorite(selectedCourse.url) ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
              <a
                href={selectedCourse.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center brutal-btn"
              >
                Visit Course
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
