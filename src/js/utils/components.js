export const loadComponents = async () => {
    const includes = document.getElementsByTagName('include');
    const promises = [];

    for (let include of includes) {
        const file = include.getAttribute('src');
        promises.push(
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(text => {
                    include.insertAdjacentHTML('afterend', text);
                    include.remove();
                })
                .catch(error => {
                    console.error(`Error loading component ${file}:`, error);
                })
        );
    }

    return Promise.all(promises);
}; 