# Tasks: Kilo Session Manager

## Phase 1: Backend Development

### Task 1.1: Setup FastAPI Project
- [ ] Create backend directory structure
- [ ] Create requirements.txt with dependencies
- [ ] Create FastAPI main.py with basic configuration
- [ ] Create database.py for SQLite connection
- [ ] Create .env.example

**Dependencies**: None  
**Estimated Time**: 2 hours

### Task 1.2: Database Models and Routes
- [ ] Create Pydantic models in models.py
- [ ] Create sessions routes (list, detail, by-project, by-date)
- [ ] Create messages routes (list for session, single message)
- [ ] Create projects routes (list, detail)
- [ ] Add SQLite FTS5 for full-text search

**Dependencies**: Task 1.1  
**Estimated Time**: 4 hours

### Task 1.3: Search and Statistics
- [ ] Create search endpoints with FTS5
- [ ] Implement search highlighting
- [ ] Create statistics endpoints
- [ ] Add pagination support

**Dependencies**: Task 1.2  
**Estimated Time**: 3 hours

### Task 1.4: Knowledge Extraction
- [ ] Create knowledge_service.py
- [ ] Implement prompt templates
- [ ] Add extraction endpoint
- [ ] Add caching for extracted knowledge

**Dependencies**: Task 1.3  
**Estimated Time**: 3 hours

### Task 1.5: Export Service
- [ ] Create export_service.py
- [ ] Implement Markdown export
- [ ] Add batch export support
- [ ] Create export endpoints

**Dependencies**: Task 1.4  
**Estimated Time**: 2 hours

### Task 1.6: Backend Docker
- [ ] Create backend/Dockerfile
- [ ] Test backend runs correctly

**Dependencies**: Task 1.5  
**Estimated Time**: 1 hour

---

## Phase 2: Frontend Development

### Task 2.1: Setup React Project
- [ ] Create frontend directory with Vite
- [ ] Install dependencies (React, Tailwind, Recharts, etc.)
- [ ] Configure Tailwind CSS
- [ ] Set up project structure

**Dependencies**: None  
**Estimated Time**: 2 hours

### Task 2.2: API Client and Types
- [ ] Create TypeScript types
- [ ] Create API service with fetch/axios
- [ ] Add error handling
- [ ] Create custom hooks

**Dependencies**: Task 2.1  
**Estimated Time**: 2 hours

### Task 2.3: Layout Components
- [ ] Create Sidebar component
- [ ] Create Header component
- [ ] Create main Layout
- [ ] Add routing with React Router

**Dependencies**: Task 2.2  
**Estimated Time**: 2 hours

### Task 2.4: Session List Page
- [ ] Create SessionCard component
- [ ] Create SessionList component
- [ ] Implement grouping by project/time
- [ ] Add pagination

**Dependencies**: Task 2.3  
**Estimated Time**: 3 hours

### Task 2.5: Session Detail Page
- [ ] Create MessageBubble component
- [ ] Create MessageThread component
- [ ] Implement collapse/expand
- [ ] Add message navigation

**Dependencies**: Task 2.4  
**Estimated Time**: 3 hours

### Task 2.6: Search Feature
- [ ] Create SearchBar component
- [ ] Create SearchResults component
- [ ] Implement keyword highlighting
- [ ] Add search filters

**Dependencies**: Task 2.5  
**Estimated Time**: 3 hours

### Task 2.7: Statistics Panel
- [ ] Create StatsPanel component
- [ ] Create chart components
- [ ] Implement trends visualization
- [ ] Add project statistics

**Dependencies**: Task 2.6  
**Estimated Time**: 3 hours

### Task 2.8: Knowledge and Export
- [ ] Create KnowledgeCard component
- [ ] Create ExportButton component
- [ ] Implement knowledge display
- [ ] Add Markdown download

**Dependencies**: Task 2.7  
**Estimated Time**: 2 hours

### Task 2.9: Frontend Docker
- [ ] Create frontend/Dockerfile
- [ ] Configure nginx for production
- [ ] Test frontend builds correctly

**Dependencies**: Task 2.8  
**Estimated Time**: 1 hour

---

## Phase 3: Integration and Deployment

### Task 3.1: Docker Compose
- [ ] Create docker-compose.yml
- [ ] Configure volume mount for kilo.db
- [ ] Set up CORS
- [ ] Test local deployment

**Dependencies**: Task 1.6, Task 2.9  
**Estimated Time**: 2 hours

### Task 3.2: Testing
- [ ] Test all API endpoints
- [ ] Test all UI components
- [ ] Test search functionality
- [ ] Test export feature

**Dependencies**: Task 3.1  
**Estimated Time**: 3 hours

### Task 3.3: Bug Fixes
- [ ] Fix any issues found during testing
- [ ] Improve error handling
- [ ] Add loading states
- [ ] Optimize performance

**Dependencies**: Task 3.2  
**Estimated Time**: 2 hours

### Task 3.4: Documentation
- [ ] Create README.md
- [ ] Add setup instructions
- [ ] Document API endpoints
- [ ] Add usage examples

**Dependencies**: Task 3.3  
**Estimated Time**: 1 hour

---

## Implementation Order

1. **Week 1**: Backend (Tasks 1.1 - 1.6)
2. **Week 2**: Frontend (Tasks 2.1 - 2.9)
3. **Week 3**: Integration & Testing (Tasks 3.1 - 3.4)

**Total Estimated Time**: ~35 hours
