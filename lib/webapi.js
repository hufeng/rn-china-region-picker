/**
 * 获取省市区数据
 */
exports.fetchRegionData = () => {
  return new Promise((resolve, reject) => {
    //qianmi static CDN
    fetch('http://pic.ofcard.com/themes/common/region/China_Region_Last.js')
      .then((res) => res._bodyText)
      .then((res) => {
        eval(res);
        resolve(CHINA_REGION);
      })
      .catch(err => reject(err))
      .done();
  });
};
