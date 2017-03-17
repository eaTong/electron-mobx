/**
 * Created by eatong on 17-3-13.
 */
import React, {PropTypes, Component} from 'react';
import {Link} from 'react-router-dom';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
  }

  componentDidMount() {

  }

  render() {
    return (
      <div className="">
        This is home page...
        <br/>
        <Link to='/todo'>todo....</Link>
      </div>
    );
  }
}

HomePage.propTypes = {};
export default HomePage;
