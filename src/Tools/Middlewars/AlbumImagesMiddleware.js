const { AppSettingsService } = require('../../Services/AppSettings/AppSettingsService');
const { DEFAULT_BRACKHIT_IMAGE } = require('../../constants');

const PROPERTIES = {
  THUMBNAIL: 'thumbnail',
  BRACKHIT_IMAGE: 'brackhitImage',
  ALBUM_IMAGE: 'albumImage',
};

module.exports.addResponseMethod = async (req, res, next) => {
  res.response = function (obj) {
    req.res = obj;
    next();
  };

  next();
};

module.exports.setDefaultImages = async (req, res) => {
  let json = req.res;
  const settings = await AppSettingsService.getAppSettingsState();

  if (!settings.showAlbumImages) {
    json = await getJsonWithDefaultImages(json);
  }

  res.send(json);
};

async function getJsonWithDefaultImages(json) {
  if (Array.isArray(json)) {
    await Promise.all(json.map((elem) => getJsonWithDefaultImages(elem)));
  } else {
    await setDefaultImage(json);
    await Promise.all(
      Object.values(json).map((value) => {
        if (value === Object(value) || Array.isArray(value)) {
          return getJsonWithDefaultImages(value);
        }
      }),
    );
  }
  return json;
}

async function setDefaultImage(obj) {
  if (obj.hasOwnProperty(PROPERTIES.THUMBNAIL)) {
    obj[PROPERTIES.THUMBNAIL] = DEFAULT_BRACKHIT_IMAGE;
  }
  if (obj.hasOwnProperty(PROPERTIES.BRACKHIT_IMAGE)) {
    obj[PROPERTIES.BRACKHIT_IMAGE] = DEFAULT_BRACKHIT_IMAGE;
  }
}
