export async function waitForElementMountedOnDom(params: {
    elementId: string;
}): Promise<void> {
    const { elementId } = params;

    const getElement = () => document.getElementById(elementId);

    const element = getElement();

    if (element === null) {
        let prElementPresentInTheDom_resolve: () => void;
        const prElementPresentInTheDom = new Promise<void>(
            resolve => (prElementPresentInTheDom_resolve = resolve)
        );

        // Observe the dom for the element to be added
        const observer = new MutationObserver(() => {
            const element = getElement();
            if (element === null) {
                return;
            }
            observer.disconnect();
            prElementPresentInTheDom_resolve();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        await prElementPresentInTheDom;
    }
}
