import React, {Component} from 'react';
import {Modal, Tree, Checkbox, Input, Form, TreeSelect} from 'antd';

const FormItem = Form.Item;
const TreeNode = TreeSelect.TreeNode;

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 6},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 16},
  },
};

class LoginModal extends Component {
  onSaveData() {
    this.props.onSaveData(this.props.form.getFieldsValue());
  }

  renderNodes(typeList) {
    return typeList.map(node => (<TreeNode key={node.id} value={node.id+''} title={node.name + node.id}>
      {this.renderNodes(node.child)}
    </TreeNode>))
  }

  render() {
    const {typeList} = this.props;
    const {getFieldDecorator} = this.props.form;
    return (<Modal
      title={'选择分类'}
      onCancel={this.props.onCancel}
      visible={true}
      onOk={() => this.onSaveData()}
      maskCloseable={false}
    >
      <Form>
        <FormItem
          {...formItemLayout}
          label="分类"
          hasFeedback>
          {getFieldDecorator('type', {
          })(
            // <Input placeholder="请填写账号"/>
            <TreeSelect>
              {this.renderNodes(typeList)}
            </TreeSelect>
          )}
        </FormItem>
      </Form>

    </Modal>)
  }
}


export default Form.create()(LoginModal);
