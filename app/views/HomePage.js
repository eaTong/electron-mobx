/**
 * Created by eatong on 17-3-13.
 */
import React, {PropTypes, Component} from 'react';
import {Button} from "antd";
import {remote} from 'electron';
import LoginModal from "./LoginModal";
import TypeModal from "./TypeModal";

const {uploaderService,} = remote.require('./app/services');

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rootPath: '',
      showLoginModal: false,
      showTypeModal: false,
      materialNameList: [],
      notMatchedFiles: [],
      businessList: [],
      typeList: [],
      currentLog: '',
      progressTime: 0
    };
  }

  componentDidMount() {
    this.toggleLoginModal();
  }


  toggleLoginModal() {
    this.setState({showLoginModal: !this.state.showLoginModal})
  }

  toggleTypeModal() {
    this.setState({showTypeModal: !this.state.showTypeModal})
  }

  onSaveData(result) {
    if (result.businessId) {

      uploaderService.selectBusiness(result.businessId).then(result => {

        this.toggleLoginModal();
        this.getTypeList();
      });
    } else {
      uploaderService.login(result).then(result => {
        if (result.data && result.data.business && result.data.business.length > 1) {
          this.setState({businessList: result.data.business})
        } else {
          this.toggleLoginModal();
          this.getTypeList();
        }
        //
      })
    }
  }

  onSelectType({type}) {
    uploaderService.selectType(type).then(result => {
      this.setState({showTypeModal: false})
      this.selectPath();
    })
  }

  getTypeList() {
    uploaderService.getTypeList().then(result => {
      this.setState({typeList: result, showTypeModal: true});
    })
  }

  autoImport() {
    uploaderService.startUploadBrand(0, 0, (currentIndex, materialIndex, status) => {
      if (status === 'done') {
        this.setState({currentLog: '全部上传完成'})
      } else {
        const {materialNameList} = this.state;
        let total = 0;
        let current = 0;
        materialNameList.forEach((brand, index) => {
          total += brand.materialNames.length;
          if (currentIndex > index) {
            current += brand.materialNames.length;
          } else if (currentIndex === index) {
            current += materialIndex;
          }
        });
        const currentLog = `完成进度：${current}/${total}(${(100 * current / total).toFixed(2)}%)
        当前品牌：${materialNameList[currentIndex].brandName}，当前目录：${materialNameList[currentIndex].materialNames[materialIndex].path},
        状态：${status}`;
        this.setState({currentLog, progressTime: 0});
        if (this.timer) {
          clearInterval(this.timer);
        }
        this.timer = setInterval(() => this.setState({progressTime: this.state.progressTime + 1}), 1000)
      }
    })
  }

  selectPath() {
    remote.dialog.showOpenDialog({
      title: '请选择图片所在目录',
      buttonLabel: '确认',
      properties: ['openDirectory'],
    }, (result) => {
      // console.log(result);
      this.setState({rootPath: result[0]});
      uploaderService.selectPath(result[0]).then(({notMatchedFiles, materialNameList}) => {
        console.log(materialNameList);
        materialNameList.forEach(item => {
          item.materialNames = item.materialNames.filter(material => material.matchedMaterials.length > 0)
        })
        this.setState({notMatchedFiles, materialNameList})
      })
    })
  }

  render() {
    const {showLoginModal, notMatchedFiles, currentLog, progressTime, showTypeModal, typeList, businessList} = this.state;
    return (
      <div className="home-page">
        <div className="current-log">最新日志：{currentLog}。耗时：{progressTime}</div>
        <Button onClick={() => this.toggleLoginModal()}>重新登录</Button>
        <Button onClick={() => this.toggleTypeModal()}>重新选择分类</Button>
        <Button onClick={() => this.selectPath()}>选择图片所在目录</Button> ： {this.state.rootPath}
        <Button onClick={() => this.autoImport()}>自动导入</Button>
        <h3>匹配材料</h3>
        {this.state.materialNameList.map(brand => {
          return (<div key={brand.brandName}>
            <p className="brand-name">{brand.brandName}</p>
            <div className="material-list">
              {brand.materialNames.map(item => (
                <div className="material-item" key={item.path}>
                  地址：{item.path}
                  <div>匹配材料：</div>
                  {item.matchedMaterials.map(mat => (
                    <p key={mat.code}>名称：{mat.name}、编码：{mat.code}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>)
        })}
        <h3>未找到匹配材料(共{notMatchedFiles.length}条)</h3>
        {notMatchedFiles.map(item => (
          <p key={item}>{item}</p>
        ))}
        {showLoginModal && (
          <LoginModal onCancel={() => this.toggleLoginModal()} onSaveData={(data) => this.onSaveData(data)}
                      businessList={businessList}/>)
        }
        {showTypeModal && (
          <TypeModal onCancel={() => this.toggleTypeModal()} onSaveData={(data) => this.onSelectType(data)}
                     typeList={typeList}/>)
        }
      </div>
    );
  }
}

HomePage.propTypes = {};
export default HomePage;
