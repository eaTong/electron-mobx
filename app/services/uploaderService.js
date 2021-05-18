/**
 * Created by eatong on 17-3-21.
 */
const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const FormData = require("form-data");

let rootPath = '';
let cookies = ''
const basePath = 'http://zc.dianshijz.cn'
// const basePath = 'http://beta.yunzhizhuang.com:8082'
let notMatchedFiles = [];
let materialNameList = [];

async function login(data) {
  const result = await axios.post(`${basePath}/api/business/login`, data)
  const businessList = result.data.data.business;
  cookies = (result.headers['set-cookie'] || []).map(item => item.replace('; Path=/', '')).join(';');
  const selectBusinessResult = await axios.get(`${basePath}/api/business/selectBusiness?_=1620971596834&business_id=${businessList[0].business_id}`, {headers: {Cookie: cookies}})
  cookies += ';' + selectBusinessResult.headers['set-cookie'].map(item => item.replace('; Path=/', '')).join(';');
  return result.data;
}

async function selectPath(path) {
  rootPath = path;
  const {materialNameList, notMatchedFiles} = await getPathFileList();
  return {materialNameList, notMatchedFiles};
}

async function getPathFileList() {
  notMatchedFiles = [];
  const materialList = await getAllMaterials();
  materialNameList = fs.readdirSync(rootPath).filter(item => pathIsDir(path.resolve(rootPath, item))).map(brandName => {
    return {
      brandName: brandName,
      materialNames: fs.readdirSync(path.resolve(rootPath, brandName)).filter(item => pathIsDir(path.resolve(rootPath, brandName, item))).map(materialName => {
        const matchedMaterials = [];
        for (const material of materialList) {
          if (material.name.indexOf(materialName) !== -1) {
            matchedMaterials.push(material);
          }
        }
        const materialPath = path.resolve(rootPath, brandName, materialName);
        if (matchedMaterials.length === 0) {
          notMatchedFiles.push(path.resolve(rootPath, brandName, materialName));
        }
        let bannerPath = '';
        let coverPath = '';
        let descriptionPath = '';
        fs.readdirSync(materialPath).forEach(name => {
          if (/banner/.test(name)) {
            bannerPath = path.resolve(materialPath, name);
          } else if (/封面\./.test(name)) {
            coverPath = path.resolve(materialPath, name);
          } else if (/描述/.test(name)) {
            descriptionPath = path.resolve(materialPath, name);
          }
        });
        return {
          path: materialPath,
          bannerPath,
          coverPath,
          descriptionPath,
          pathName: materialName,
          matchedMaterials
        }
      }).filter(mat => mat.matchedMaterials.length > 0)
    }
  });
  return {materialNameList, notMatchedFiles}
}

async function startUploadBrand(index = 0, materialIndex = 0, onProgress) {

  const brand = materialNameList[index];
  if (index === materialNameList.length) {
    onProgress(index, materialIndex, 'done')
    // return;
  } else if (materialIndex === brand.materialNames.length) {
    await startUploadBrand(index + 1, 0, onProgress)
  } else {
    const materialInfo = brand.materialNames[materialIndex];
    const imageInfo = {};
    if (fs.existsSync(materialInfo.coverPath)) {
      onProgress(index, materialIndex, '开始上传封面。。。');
      const coverImages = await uploadImage(materialInfo.coverPath);
      imageInfo.images = [coverImages];
    }
    if (fs.existsSync(materialInfo.bannerPath)) {
      const bannerPathList = fs.readdirSync(materialInfo.bannerPath).map(name => path.resolve(materialInfo.bannerPath, name));
      if (bannerPathList && bannerPathList.length > 0) {
        onProgress(index, materialIndex, '开始上传banner。。。');
        const banner_image = await uploadMultipleImage(bannerPathList, (i, t) => onProgress(index, materialIndex, `开始上传banner图片${i}/${t}。。。`));
        imageInfo.banner_images = banner_image;
      }
    }
    if (fs.existsSync(materialInfo.descriptionPath)) {
      const descriptionPathList = fs.readdirSync(materialInfo.descriptionPath).map(name => path.resolve(materialInfo.descriptionPath, name));
      if (descriptionPathList && descriptionPathList.length > 0) {
        onProgress(index, materialIndex, '开始上传描述图片。。。');
        const descriptionImages = await uploadMultipleImage(descriptionPathList, (i, t) => onProgress(index, materialIndex, `开始上传描述图片${i}/${t}。。。`));
        imageInfo.remark = descriptionImages.map(item => `<p><img src="${item}"/></p>`).join('');
      }
    }

    const donePath = path.resolve(materialInfo.path, '..', '..', '..', '自动处理完成', brand.brandName, materialInfo.pathName);
    fs.ensureDirSync(donePath);
    try {
      fs.moveSync(path.resolve(materialInfo.path), donePath, {overwrite: true})
    } catch (e) {
      console.error(e);
      console.error(path.resolve(materialInfo.path), donePath);
    }

    materialInfo.matchedMaterials.forEach(async (material) => {
      const data = {...material, ...imageInfo};
      await axios.post(`${basePath}/api/store/material/save`, data, {headers: {Cookie: cookies}});
      onProgress(index, materialIndex, '数据处理完成。。。');
    })


    await startUploadBrand(index, materialIndex + 1, onProgress);

  }
}

async function getAllMaterials() {
  const result = await axios.post(`${basePath}/api/store/material/get`, {
    key_word: "",
    page: 0,
    size: 20000
  }, {headers: {Cookie: cookies}});
  // console.log(materials)
  return result.data.data.list;
}

function pathIsDir(pathName) {
  const file = fs.statSync(pathName);
  return !/.DS_/.test(pathName) && file.isDirectory();
}


async function uploadImage(path) {
  try {

    const form = new FormData();
    form.append("file", fs.createReadStream(path));
    const result = await axios.post(`${basePath}/api/file/upload`, form, {
      headers: {
        ...form.getHeaders(),
        Cookie: cookies
      }
    });
    const images = result.data.data
    if (images[0]) {
      return images[0].new.replace(/\?type=new/, '');
    }
    return '';
  } catch (e) {
    console.error(path);
    console.log(e)
    return '';
  }
}

async function uploadMultipleImage(pathList, onProgress) {
  const list = [];
  // let index =0;
  await doUpload(0)
  return list;

  async function doUpload(index) {
    if (index === pathList.length) {
      return list;
    }
    const url = await uploadImage(pathList[index]);
    list.push(url);
    onProgress && onProgress(pathList.length, index);
    await doUpload(index + 1)
    // return [...list, url];
  }
}

// (async () => {
//   await login({"account": "18288756143", "password": "a12345"});
//   await selectPath('/Users/eatong/Downloads/点石主材供应商图片1/瓷砖');
//   await startUploadBrand(0, 0, (index, materialIndex, message) => {
//     console.log(index, materialIndex, message);
//   });
// })()

module.exports = {
  selectPath,
  login,
  startUploadBrand
};
