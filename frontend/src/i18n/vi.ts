import type { TranslationKey } from "./en";

const vi: Record<TranslationKey, string> = {
  // App
  "app.title": "AgentDungeon",
  "app.initializingSystems": "Đang thắp đuốc...",

  // Header Controls
  "header.simulate": "MÔ PHỎNG",
  "header.reset": "ĐẶT LẠI",
  "header.clearDb": "XÓA DỮ LIỆU",
  "header.debugOn": "DEBUG BẬT",
  "header.debugOff": "DEBUG TẮT",
  "header.settings": "CÀI ĐẶT",
  "header.help": "TRỢ GIÚP",
  "header.status": "Trạng thái",
  "header.connected": "ĐÃ KẾT NỐI",
  "header.disconnected": "MẤT KẾT NỐI",
  "header.aiOn": "BẬT",
  "header.aiOff": "TẮT",
  "header.agents": "agent",
  "header.tour": "HƯỚNG DẪN",
  "header.commandCenter": "SẢNH",
  "header.more": "THÊM",
  "header.moreMenu": "Thêm thao tác",
  "help.tour": "Xem hướng dẫn",

  // Command Center
  "commandCenter.title": "Sảnh Bang Hội",
  "commandCenter.zone.needsYou": "Cần bạn",
  "commandCenter.zone.working": "Đang làm",
  "commandCenter.zone.done": "Xong",
  "commandCenter.zone.ended": "Đã kết thúc",
  "commandCenter.moreCount": "+{count} nữa",
  "commandCenter.popup.todos": "Việc cần làm",
  "commandCenter.popup.employees": "Mạo hiểm giả",
  "commandCenter.popup.terminal": "Terminal",
  "commandCenter.popup.drillIn": "Mở",
  "commandCenter.initializing": "Đang mở Sảnh Bang Hội...",
  "commandCenter.board.allSessions": "TẤT CẢ PHIÊN",
  "commandCenter.board.terminals": "Terminal",
  "commandCenter.board.employees": "Mạo hiểm giả",
  "commandCenter.board.todos": "Việc cần làm",

  // Modals
  "modal.confirmDbWipe": "Xác nhận xóa dữ liệu",
  "modal.cancel": "Hủy",
  "modal.wipeAllData": "Xóa toàn bộ dữ liệu",
  "modal.wipeWarning":
    "Bạn có chắc muốn xóa vĩnh viễn toàn bộ lịch sử phiên và sự kiện? Không thể hoàn tác, và trạng thái hiện tại sẽ được đặt lại.",
  "modal.keyboardShortcuts": "Phím tắt",
  "modal.close": "Đóng",
  "modal.toggleDebug": "Bật/tắt chế độ debug",
  "modal.showAgentPaths": "Hiện đường đi của agent",
  "modal.showQueueSlots": "Hiện vị trí xếp hàng",
  "modal.showPhaseLabels": "Hiện nhãn giai đoạn",
  "modal.deleteSession": "Xóa phiên",
  "modal.delete": "Xóa",
  "modal.deleteSessionConfirm": "Bạn có chắc muốn xóa phiên",
  "modal.deleteSessionWarning": "Thao tác này sẽ xóa vĩnh viễn",
  "modal.events": "sự kiện",
  "modal.cannotBeUndone": "Không thể hoàn tác.",

  // Settings
  "settings.title": "Cài đặt",
  "settings.clockType": "Kiểu đồng hồ",
  "settings.analog": "Kim",
  "settings.digital": "Số",
  "settings.timeFormat": "Định dạng giờ",
  "settings.12hour": "12 giờ",
  "settings.24hour": "24 giờ",
  "settings.sessionBehavior": "Hành vi phiên",
  "settings.autoFollow": "Tự theo dõi phiên mới",
  "settings.autoFollowDesc":
    "Tự chuyển sang phiên mới trong cùng project",
  "settings.clockTip":
    "Mẹo: bấm vào đồng hồ trong sảnh để đổi nhanh giữa các chế độ.",
  "settings.language": "Ngôn ngữ",
  "settings.tabs.general": "Chung",
  "settings.tabs.building": "Dungeon",
  "settings.building.name": "Tên dungeon",
  "settings.building.namePlaceholder": "Hầm Sâu",
  "settings.building.floors": "Tầng hầm",
  "settings.building.addFloor": "Thêm tầng",
  "settings.building.floorName": "Tên tầng",
  "settings.building.floorNumber": "Tầng",
  "settings.building.accentColor": "Màu nhấn",
  "settings.building.icon": "Biểu tượng",
  "settings.building.repos": "Thư mục project",
  "settings.building.reposPlaceholder": "claude-office, my-api, web-ui",
  "settings.building.save": "Lưu",
  "settings.building.saving": "Đang lưu...",
  "settings.building.saved": "Đã lưu!",
  "settings.building.deleteFloor": "Xóa",
  "settings.building.noFloors": "Chưa cấu hình tầng nào",
  "settings.building.enableHint":
    "Thêm tầng và gán tên thư mục project để bật bản đồ dungeon",
  "settings.building.unsavedWarning":
    "Có thay đổi dungeon chưa lưu. Bỏ các thay đổi đó?",
  "settings.building.saveFailed": "Lưu thất bại: {status} {statusText}",
  "settings.building.saveUnreachable":
    "Không kết nối được backend. Server có đang chạy không?",

  // Sessions
  "sessions.title": "Phiên",
  "sessions.loading": "Đang tải phiên...",
  "sessions.noSessions": "Chưa có phiên nào",
  "sessions.unknownProject": "Project không rõ",
  "sessions.deleteSession": "Xóa phiên",
  "sessions.events": "sự kiện",
  "sessions.events_one": "{count} sự kiện",
  "sessions.events_other": "{count} sự kiện",
  "sessions.expandSidebar": "Mở rộng thanh bên",
  "sessions.collapseSidebar": "Thu gọn thanh bên",
  "sessions.dragToResize": "Kéo để đổi kích thước",

  // Right Sidebar
  "sidebar.events": "Sự kiện",
  "sidebar.conversation": "Hội thoại",

  // Event Log
  "eventLog.title": "Nhật ký sự kiện",
  "eventLog.events": "sự kiện",
  "eventLog.events_one": "{count} sự kiện",
  "eventLog.events_other": "{count} sự kiện",
  "eventLog.waiting": "Đang chờ sự kiện...",

  // Agent Status
  "agentStatus.title": "Tổ đội",
  "agentStatus.agents": "agent",
  "agentStatus.agents_one": "{count} agent",
  "agentStatus.agents_other": "{count} agent",
  "agentStatus.noAgents": "Chưa có agent",
  "agentStatus.agent": "Agent",
  "agentStatus.desk": "Trạm",
  "agentStatus.noTaskSummary": "Chưa có tóm tắt nhiệm vụ",
  "agentStatus.noRecentToolCall": "Chưa gọi tool nào gần đây",
  "agentStatus.inQueue": "Trong hàng {queueType} (vị trí {position})",

  // Git Status
  "git.title": "Trạng thái Git",
  "git.waitingForStatus": "Đang chờ trạng thái git...",
  "git.noSession": "Chưa chọn phiên",
  "git.noRepo": "Không tìm thấy repository git",
  "git.changedFiles": "File thay đổi",
  "git.staged": "đã stage",
  "git.recentCommits": "Commit gần đây",
  "git.noCommits": "Chưa có commit",
  "git.modified": "đã sửa",
  "git.added": "đã thêm",
  "git.deleted": "đã xóa",
  "git.renamed": "đã đổi tên",
  "git.copied": "đã sao chép",
  "git.untracked": "chưa theo dõi",
  "git.ignored": "bị bỏ qua",

  // Conversation
  "conversation.title": "Hội thoại",
  "conversation.msgs": "tin",
  "conversation.msgs_one": "{count} tin",
  "conversation.msgs_other": "{count} tin",
  "conversation.thinking": "Đang suy nghĩ",
  "conversation.showMore": "Xem thêm",
  "conversation.collapse": "Thu gọn",
  "conversation.claude": "Claude",
  "conversation.showFullResponse": "Xem toàn bộ câu trả lời",
  "conversation.hideToolCalls": "Ẩn lệnh gọi tool",
  "conversation.showToolCalls": "Hiện lệnh gọi tool",
  "conversation.expandConversation": "Mở rộng hội thoại",
  "conversation.close": "Đóng",
  "conversation.noConversation":
    "Chưa có hội thoại. Hãy bắt đầu một phiên Claude Code.",

  // Event Detail Modal
  "eventDetail.summary": "Tóm tắt",
  "eventDetail.tool": "Tool",
  "eventDetail.agentName": "Tên agent",
  "eventDetail.taskDescription": "Mô tả nhiệm vụ",
  "eventDetail.userPrompt": "Prompt của bạn",
  "eventDetail.thinking": "Suy nghĩ",
  "eventDetail.message": "Tin nhắn",
  "eventDetail.resultSummary": "Tóm tắt kết quả",
  "eventDetail.errorType": "Loại lỗi",
  "eventDetail.toolInput": "Đầu vào tool",
  "eventDetail.noDetail": "Sự kiện này không có thêm chi tiết.",

  // Loading Screen
  "loading.office": "Đang vào dungeon...",

  // Zoom Controls
  "zoom.in": "Phóng to",
  "zoom.out": "Thu nhỏ",
  "zoom.reset": "Đặt lại thu phóng",

  // Mobile
  "mobile.menu": "Menu",
  "mobile.agentActivity": "Hoạt động agent",
  "mobile.boss": "TRƯỞNG BANG",
  "mobile.noActiveAgents": "Không có agent nào đang hoạt động",

  // Status Messages
  "status.switchedToSession": "Đã chuyển sang phiên {sessionId}...",
  "status.deletingSession": "Đang xóa phiên {sessionId}...",
  "status.sessionDeleted": "Đã xóa phiên.",
  "status.failedDeleteSession": "Xóa phiên thất bại.",
  "status.errorConnecting": "Lỗi kết nối tới backend.",
  "status.sessionRenamed": "Đã đổi tên phiên.",
  "status.failedRenameSession": "Đổi tên phiên thất bại.",
  "status.clearingDatabase": "Đang xóa dữ liệu...",
  "status.databaseCleared": "Đã xóa dữ liệu.",
  "status.failedClearDatabase": "Xóa dữ liệu thất bại.",
  "status.triggeringSimulation": "Đang chạy mô phỏng...",
  "status.simulationStarted": "Đã bắt đầu mô phỏng!",
  "status.failedSimulation": "Chạy mô phỏng thất bại.",
  "status.storeReset": "Đã đặt lại trạng thái.",
  "status.sessionDeletedSwitched": "Đã xóa phiên. Chuyển sang {sessionName}",
  "status.sessionDeletedNoOthers":
    "Đã xóa phiên. Không còn phiên nào khác.",
  "status.connectedTo": "Đã kết nối tới {sessionName}",
  "status.autoFollowed": "Tự theo dõi phiên mới: {sessionName}",

  // Navigation
  "navigation.building": "Dungeon",

  // Tour
  "tour.steps.welcome.title": "Chào mừng",
  "tour.steps.welcome.description":
    "Đây là Sảnh Bang Hội. Bấm vào một tầng để khám phá.",
  "tour.steps.singleWelcome.title": "Chào mừng tới AgentDungeon",
  "tour.steps.singleWelcome.description":
    "Dungeon pixel này hiển thị các phiên Claude Code của bạn theo thời gian thực. Cùng xem qua một vòng nhé.",
  "tour.steps.simulate.title": "Chạy mô phỏng",
  "tour.steps.simulate.description":
    "Bấm Mô phỏng để bang hội hoạt động.",
  "tour.steps.agentsArrive.title": "Mạo hiểm giả đến",
  "tour.steps.agentsArrive.description":
    "Mạo hiểm giả bước qua cổng dịch chuyển, đi tới trạm của mình và bắt đầu nhiệm vụ.",
  "tour.steps.inspectAgent.title": "Xem một agent",
  "tour.steps.inspectAgent.description":
    "Bấm vào bất kỳ nhân vật nào để xem chi tiết.",
  "tour.steps.focusPopup.title": "Bảng chi tiết",
  "tour.steps.focusPopup.description":
    "Tại đây bạn có thể sao chép tin nhắn và nhảy tới terminal. Dungeon cập nhật theo thời gian thực khi Claude làm việc.",
  "tour.steps.zoomOut.title": "Thu nhỏ",
  "tour.steps.zoomOut.description":
    "Thử thu nhỏ để xem toàn cảnh.",
  "tour.steps.settings.title": "Cấu hình tầng",
  "tour.steps.settings.description":
    "Mở Cài đặt để thêm tầng và gán thư mục project cho bản đồ dungeon nhiều tầng.",
  "tour.skip": "Bỏ qua hướng dẫn",
  "tour.next": "Tiếp",

  // Attention System
  "attention.toast.permissionRequest": "{agentName} cần cấp quyền",
  "attention.toast.error": "{agentName} gặp lỗi",
  "attention.toast.taskCompleted": "{agentName} đã xong một nhiệm vụ",
  "attention.toast.agentArrived": "{agentName} đã vào bang hội",
  "attention.toast.stop": "{agentName} đã dừng",
  "attention.toast.backgroundTask": "{agentName}: {taskDescription}",
  "attention.commandBar.placeholder": "Gõ lệnh...",
  "attention.commandBar.focusAgent": "Tới agent: {name}",
  "attention.commandBar.focusBoss": "Tới terminal của Trưởng bang",
  "attention.commandBar.showAttention": "Hiện danh sách cần chú ý",
  "attention.commandBar.dismissAll": "Đóng mọi thông báo",
  "attention.commandBar.toggleDebug": "Bật/tắt debug",
  "attention.commandBar.togglePaths": "Bật/tắt hiển thị đường đi",
  "attention.commandBar.toggleQueueSlots": "Bật/tắt vị trí xếp hàng",
  "attention.commandBar.togglePhaseLabels": "Bật/tắt nhãn giai đoạn",
  "attention.commandBar.toggleObstacles": "Bật/tắt vật cản",
  "attention.commandBar.noResults": "Không có lệnh phù hợp",
  "attention.popup.focusTerminal": "Tới terminal",
  "attention.popup.close": "Đóng",
  "attention.popup.state": "Trạng thái",
  "attention.popup.task": "Nhiệm vụ",
  "attention.popup.type": "Loại",
  "attention.popup.desk": "Trạm",
  "attention.popup.boss": "Trưởng bang",
  "attention.popup.agent": "Agent",
  "settings.commandBar": "Thanh lệnh (⌘K)",
  "settings.clickToFocus": "Bấm để tới terminal",
  "settings.toastFilters": "Thông báo",
  "settings.toastAutoDismiss": "Thời gian tự ẩn",
  "settings.filterPermission": "Yêu cầu cấp quyền",
  "settings.filterError": "Lỗi và dừng",
  "settings.filterTaskComplete": "Hoàn thành nhiệm vụ",
  "settings.filterArrival": "Agent đến",

  // Hall tally board (tool uses since compaction)
  "hall.tally.title": "Phép đã dùng",
  "hall.tally.subtitle": "từ lần nghỉ trước",

  // Scene-only mode toggle
  "header.sceneOnly": "CHỈ CẢNH",
  "header.showPanels": "HIỆN BẢNG",
};

export default vi;
