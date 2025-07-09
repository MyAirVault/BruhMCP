# Logs Page Documentation

## Overview

The Logs page provides a comprehensive view of all system logs with advanced filtering and export capabilities. Users can access this page by clicking "View Logs" from any MCP dropdown menu in the Dashboard.

## Features

### Core Functionality
- **MCP-Specific Logs**: View logs for a specific MCP or all system logs
- **Real-time Log Display**: Shows logs in a clean, tabular format with timestamps and icons
- **Multi-level Filtering**: Filter by log level (error, warn, info, debug), source, and time range
- **Search Functionality**: Search across log messages, MCP names, and log levels
- **Export/Download**: Export filtered logs as JSON files
- **Refresh Capability**: Manually refresh logs to get latest data
- **Visual Icons**: Contextual icons for log levels, sources, and MCP types
- **Navigation**: Back button to return to dashboard when viewing specific MCP logs

### Filter Options

#### Log Levels
- **All Levels**: Show all log entries
- **Error**: Critical errors and exceptions
- **Warning**: Warning conditions
- **Info**: General information messages
- **Debug**: Debug information (development only)

#### Sources
- **All Sources**: Show logs from all sources
- **Application**: Application-level logs
- **Access**: API access logs
- **Error**: Error-specific logs

#### Time Ranges
- **All Time**: Show all historical logs
- **Last Hour**: Logs from the past hour
- **Last Day**: Logs from the past 24 hours
- **Last Week**: Logs from the past 7 days
- **Last Month**: Logs from the past 30 days

### User Interface

#### Layout
- **Header**: Same header/footer as Dashboard for consistency
- **Title Section**: Dynamic title showing "All Logs" or "{MCP Name} Logs" with appropriate icons
- **Back Button**: Always visible - navigate back to Dashboard from any logs view
- **Filters Section**: Comprehensive filtering controls with custom dropdowns
- **Results Table**: Table with log details and contextual icons

#### Log Entry Display
Each log entry shows:
- **Timestamp**: Formatted local time
- **Level**: Color-coded badge with matching icon (AlertCircle for errors, Info for info, etc.)
- **Source**: Log source type with contextual icon (Activity for app, Globe for access, etc.)
- **MCP**: Associated MCP name with type-specific icon (Globe for Gmail, Server for servers, etc.)
- **Message**: Log message with expandable details

#### Visual Icons
- **Log Levels**: AlertCircle (error/warn), Info (info), Bug (debug)
- **Sources**: Activity (app), Globe (access), AlertCircle (error)
- **MCP Types**: Globe (Gmail/email), Activity (Slack/Discord), Database (database), Server (server/API), FileText (default)
- **Navigation**: ArrowLeft (back button), FileText (general logs icon)

### Export Functionality

#### Export Format
- **JSON Format**: Structured data export
- **Filtered Data**: Only exports currently filtered/visible logs
- **Filename**: `logs_{YYYY-MM-DD}.json`

#### Download Process
1. User applies desired filters
2. Click "Export" button
3. Browser downloads JSON file with filtered logs
4. File contains all log metadata and details

## File Structure

```
/frontend/src/pages/Logs.tsx
/frontend/src/components/CustomDropdown.tsx
```

## Component Architecture

### State Management
```typescript
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: 'app' | 'access' | 'error';
  message: string;
  mcpId?: string;
  mcpName?: string;
  details?: Record<string, unknown>;
}
```

### Key Components
- **CustomDropdown**: Reusable dropdown component matching modal styles
- **Filter Controls**: Search input and custom dropdowns for level, source, and time filters
- **Results Counter**: Shows filtered vs. total log count
- **Export Button**: Triggers JSON download
- **Refresh Button**: Reloads log data
- **Log Table**: Displays formatted log entries

### Custom Dropdown Features
- **Consistent Styling**: Matches the dropdown style used in CreateMCPModal
- **Smart Positioning**: Automatically flips up when near viewport bottom
- **Keyboard Navigation**: Arrow keys and Enter support
- **Click Outside**: Closes dropdown when clicking outside
- **Smooth Animations**: Rotating arrow icon and smooth transitions

## Integration with Backend

### API Endpoints (Future Implementation)
Based on the logging documentation, the page should connect to:
- `LogAccessService.getUserMCPLogs()` - Get filtered logs
- `LogAccessService.exportUserLogs()` - Export user logs
- Real-time log streaming for live updates

### Current Implementation
- Uses mock data for demonstration
- Simulates API loading states
- Implements all filtering logic client-side

## Navigation

### Access Points
- **Dashboard MCP Dropdown**: Click "View Logs" from any MCP dropdown menu (shows logs for that specific MCP)
- **Dashboard Button**: Click "View All Logs" button below "Manage your MCPs" text (shows all system logs)
- **Direct URL**: `/logs` route (shows all system logs)
- **MCP-Specific URL**: `/logs?mcp={mcpId}&name={mcpName}` (shows logs for specific MCP)

### Routing
```typescript
// App.tsx
<Route path="/logs" element={<Logs />} />

// URL Parameters
// /logs - All system logs
// /logs?mcp=1&name=Personal%20Gmail%20MCP - Specific MCP logs
```

### Navigation Flow
1. **From Dashboard MCP**: User clicks "View Logs" in MCP dropdown → navigates to `/logs?mcp={id}&name={name}`
2. **From Dashboard Button**: User clicks "View All Logs" button → navigates to `/logs`
3. **Back to Dashboard**: User clicks back arrow (always visible) → navigates to `/dashboard`
4. **Direct Access**: User visits `/logs` directly → shows all system logs with back button

## User Experience

### Loading States
- Initial page load shows loading spinner
- Refresh button shows spinning icon during reload
- Smooth transitions between filter applications

### Filter Behavior
- **Real-time**: Filters apply immediately on change
- **Combinable**: Multiple filters work together
- **Clearable**: "Clear filters" button resets all filters
- **Persistent**: Filter state maintained during session

### Responsive Design
- **Mobile/Tablet (< 1024px)**: Card-based layout with stacked information
- **Desktop (≥ 1024px)**: Full table layout with all columns
- **Touch-friendly**: Large touch targets and cursor pointers for all interactive elements
- **Adaptive Filters**: Grid layout adjusts from 1 column (mobile) to 4 columns (desktop)
- **Responsive Buttons**: Action buttons stack vertically on mobile, horizontally on desktop

#### Mobile Card Layout Features
- **Compact Cards**: Each log entry displayed as a card with key information
- **Visual Hierarchy**: Level badge and timestamp prominently displayed
- **Source & MCP Info**: Clearly separated with icons
- **Expandable Details**: Details section works seamlessly in card format
- **Proper Spacing**: Optimized padding and margins for touch interaction

## Performance Considerations

### Optimization Features
- **Client-side Filtering**: Fast filter application without server requests
- **Lazy Loading**: Table virtualization for large log sets (future enhancement)
- **Debounced Search**: Prevents excessive filtering during typing

### Future Enhancements
- **Pagination**: Handle large log datasets
- **Real-time Updates**: WebSocket connection for live logs
- **Advanced Filtering**: Date range pickers, regex search
- **Log Streaming**: Continuous log updates without refresh

## Development Notes

### Mock Data
Current implementation uses mock data that represents:
- Different log levels and sources
- Multiple MCP instances
- Realistic timestamps and messages
- Detailed error information

### Testing Considerations
- Filter combination testing
- Export functionality verification
- Responsive layout testing
- Loading state validation

### Security
- User isolation: Only shows logs for authenticated user
- No sensitive data exposure in mock logs
- Proper error handling for failed API calls

## Related Documentation
- [Dashboard Page](./dashboard-page.md) - Main dashboard with "View Logs" access
- [Logging and Monitoring](../logging-monitoring.md) - Backend logging architecture
- [Frontend Enhancements](./frontend-enhancements.md) - UI/UX improvements