import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar - Desktop always visible */}
      <aside className={`
        hidden md:flex md:flex-col fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
      `}>
        <Sidebar />
      </aside>

      {/* Mobile Sidebar - Slide in */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 md:hidden">
          <Sidebar />
        </aside>
      )}

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Header */}
        <header className="fixed md:static top-0 left-0 right-0 md:left-64 h-16 bg-white border-b border-gray-200 shadow-sm z-20">
          <Header />
        </header>

        {/* Page Content */}
        <main className="pt-16 md:pt-0">
          <div className="px-4 md:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
