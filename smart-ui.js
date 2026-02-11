
class SmartUIManager {
    constructor(config, view) {
        this.config = Object.assign({
            hideDelay: 3000,
            animDuration: 500
        }, config);
        this.view = view; // { showButtons(), hideButtons(), isMobile() }
        this.timer = null;
        this.isVisible = true;
        this.lastTapTime = 0;
    }

    start() {
        this.show();
    }

    stop() {
        this.clearTimer();
        this.view.showButtons(); // Always show when stopping/exiting mode? Or just cleanup
    }

    clearTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    show() {
        this.isVisible = true;
        this.view.showButtons();
        this.resetHideTimer();
    }

    hide() {
        this.isVisible = false;
        this.view.hideButtons();
        this.clearTimer();
    }

    resetHideTimer() {
        this.clearTimer();
        this.timer = setTimeout(() => {
            this.hide();
        }, this.config.hideDelay);
    }

    onInteraction() {
        // If hidden, show. If shown, reset timer.
        if (!this.isVisible) {
            this.show();
        } else {
            this.resetHideTimer();
        }
    }

    onMouseMove() {
        // Desktop: show on move
        if (!this.view.isMobile()) {
            this.onInteraction();
        }
    }

    onTouchStart() {
        // Mobile: Double tap logic is handled separately, 
        // but simple interaction might not trigger show if we strictly follow "double tap triggers display"
        // User req: "mobile devices need anti-mistouch mechanism (double click triggers display)"
        // This implies single touch should NOT trigger display (or at least not the buttons).
        // But we need to keep the timer alive if it IS visible?
        if (this.isVisible) {
            this.resetHideTimer();
        }
    }

    onDoubleTap() {
        this.show();
    }

    onTriggerHover() {
        this.show();
    }
}

// Simple test runner for Node environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartUIManager;
}
