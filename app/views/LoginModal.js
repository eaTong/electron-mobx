import React, {Component} from 'react';
import {Modal, Tree, Checkbox, Input, Form, Radio} from 'antd';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

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
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onSaveData(values);
      }
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return (<Modal
      title={'登录'}
      onCancel={this.props.onCancel}
      visible={true}
      onOk={() => this.onSaveData()}
      maskCloseable={false}
    >
      <Form>
        <FormItem
          {...formItemLayout}
          label="账号"
          hasFeedback>
          {getFieldDecorator('account', {
            initialValue: '15198784497',
            rules: [
              {required: true, whitespace: true, message: '请填写账号'}
            ]
          })(
            <Input placeholder="请填写账号"/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="密码"
          hasFeedback>
          {getFieldDecorator('password', {
            initialValue: 'a12345',
            rules: [
              {required: true, whitespace: true, message: '请填写密码'}
            ]
          })(
            <Input placeholder="请输入新密码"/>
          )}
        </FormItem>
        {this.props.businessList.length > 0 && (
          <FormItem
            {...formItemLayout}
            label="选择公司"
            hasFeedback>
            {getFieldDecorator('businessId', {
              rules: [
                {required: true, whitespace: true, message: '请选择公司'}
              ]
            })(
              <RadioGroup>
                {this.props.businessList.map(item => (
                  <Radio key={item.business_id + ''} value={item.business_id + ''}>{item.business_name}</Radio>
                ))}
              </RadioGroup>
            )}
          </FormItem>

        )}

      </Form>

    </Modal>)
  }
}


export default Form.create()(LoginModal);
