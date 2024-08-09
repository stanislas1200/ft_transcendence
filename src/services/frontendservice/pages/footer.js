import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

class Footer extends React.Component {
	render() {
		return (
			<div className="row mt-5">
				<div className="col-md-12 text-center">
					<footer>
						<p>&copy; {new Date().getFullYear()} Pong 🏓. All rights reserved.</p>
					</footer>
				</div>
			</div>
		)
	}
}
export default Footer;