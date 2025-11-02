import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  header,
  sidebar,
  footer,
}) => {
  return (
    <div className="app-layout">
      {header && <header className="app-header">{header}</header>}
      
      <div className="app-main">
        {sidebar && <aside className="app-sidebar">{sidebar}</aside>}
        <main className="app-content">{children}</main>
      </div>

      {footer && <footer className="app-footer">{footer}</footer>}

      <style>{`
        .app-layout {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .app-header {
          flex-shrink: 0;
          z-index: 100;
        }

        .app-main {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }

        .app-sidebar {
          flex-shrink: 0;
          width: 300px;
          overflow-y: auto;
          background: rgba(10, 14, 39, 0.95);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 50;
        }

        .app-content {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .app-footer {
          flex-shrink: 0;
          z-index: 100;
        }

        @media (max-width: 768px) {
          .app-sidebar {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .app-sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;