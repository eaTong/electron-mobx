/**
 * Created by eatong on 17-3-21.
 */
const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const FormData = require("form-data");

let rootPath = '';
let cookies = ''
let selectedType = '';
const basePath = 'https://mall.mjzsxxkj.cn'
// const basePath = 'http://beta.yunzhizhuang.com:8082'
let notMatchedFiles = [];
let materialNameList = [];
let materialList = [];
let businessList = [];


async function login(data) {
  const result = await axios.post(`${basePath}/api/business/login`, data)
  businessList = result.data.data.business;
  cookies = (result.headers['set-cookie'] || []).map(item => item.replace('; Path=/', '')).join(';');
  if (businessList.length === 1) {
    await selectBusiness(businessList[0].business_id)
  }
  return result.data;
}

async function selectBusiness(businessId) {
  console.log(businessId)
  const selectBusinessResult = await axios.get(`${basePath}/api/business/selectBusiness?_=1620971596834&business_id=${businessId}`, {headers: {Cookie: cookies}})
  console.log(selectBusinessResult);
  cookies += ';' + selectBusinessResult.headers['set-cookie'].map(item => item.replace('; Path=/', '')).join(';');
}

async function selectPath(path) {
  rootPath = path;
  const {materialNameList, notMatchedFiles} = await getPathFileList();
  return {materialNameList, notMatchedFiles};
}

async function selectType(type) {
  selectedType = type;
  materialList = await getAllMaterials();
  console.log(materialList.length);
}

async function getPathFileList() {
  notMatchedFiles = [];
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
          } else if (/描述/.test(name)) {
            descriptionPath = path.resolve(materialPath, name);
          } else if (/.*\.((jpe?g)|(png)|(bmp))/i.test(name)) {
            coverPath = path.resolve(materialPath, name);
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
    } else {
      console.error(`找不到封面图:${materialInfo.path}`)
    }
    if (fs.existsSync(materialInfo.bannerPath)) {
      const bannerPathList = fs.readdirSync(materialInfo.bannerPath).map(name => path.resolve(materialInfo.bannerPath, name));
      if (bannerPathList && bannerPathList.length > 0) {
        onProgress(index, materialIndex, '开始上传banner。。。');
        const banner_image = await uploadMultipleImage(bannerPathList, (i, t) => onProgress(index, materialIndex, `开始上传banner图片${i}/${t}。。。`));
        imageInfo.banner_images = banner_image.filter(item => item);
      }
    } else {
      console.error(`找不到banner图:${materialInfo.path}`)
    }
    if (fs.existsSync(materialInfo.descriptionPath)) {
      const descriptionPathList = fs.readdirSync(materialInfo.descriptionPath).map(name => path.resolve(materialInfo.descriptionPath, name));
      if (descriptionPathList && descriptionPathList.length > 0) {
        onProgress(index, materialIndex, '开始上传描述图片。。。');
        const descriptionImages = await uploadMultipleImage(descriptionPathList, (i, t) => onProgress(index, materialIndex, `开始上传描述图片${i}/${t}。。。`));
        imageInfo.remark = descriptionImages.filter(item => item).map(item => `<p><img src="${item}"/></p>`).join('');
      }
    } else {
      console.error(`找不到描述图:${materialInfo.path}`)
    }

    materialInfo.matchedMaterials.forEach(async (material) => {
      const data = {...material, ...imageInfo};
      await axios.post(`${basePath}/api/store/material/save`, data, {headers: {Cookie: cookies}});
      onProgress(index, materialIndex, '数据处理完成。。。');
    })

    const donePath = path.resolve(materialInfo.path, '..', '..', '..', '自动处理完成', brand.brandName, materialInfo.pathName);
    fs.ensureDirSync(donePath);
    try {
      fs.moveSync(path.resolve(materialInfo.path), donePath, {overwrite: true})
    } catch (e) {
      console.error(e);
      console.error(path.resolve(materialInfo.path), donePath);
    }
    await startUploadBrand(index, materialIndex + 1, onProgress);
  }
}

async function getAllMaterials() {
  const result = await axios.post(`${basePath}/api/store/material/get`, {
    key_word: "",
    page: 0,
    size: 20000,
    type_id: selectedType
  }, {headers: {Cookie: cookies}});
  // console.log(materials)
  return result.data.data.list;
}

async function getTypeList() {
  const result = await axios.post(`${basePath}/api/store/material/type/get`, {}, {headers: {Cookie: cookies}});
  // console.log(materials)
  return result.data.data;
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
  startUploadBrand,
  selectBusiness,
  getTypeList,
  selectType,
};
