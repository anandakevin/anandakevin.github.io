const ASSET_BASE_PATH = '@assets';

export const getAssetPath = (path) => {
    return `${ASSET_BASE_PATH}/${path}`;
};

export const getImagePath = (filename) => {
    return getAssetPath(`images/${filename}`);
};

export const getIconPath = (filename) => {
    return getAssetPath(`icons/${filename}`);
}; 