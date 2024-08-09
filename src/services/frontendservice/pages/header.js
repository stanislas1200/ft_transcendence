import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';

class Header extends React.Component {
	render() {
		return (
			<div>
				<nav class="navbar navbar-expand-lg bg-body-tertiary">
				<div class="container-fluid">
					<a class="navbar-brand" href="#">Pong 🏓</a>
					<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
						<span class="navbar-toggler-icon"></span>
					</button>
					<div class="collapse navbar-collapse" id="navbarNav">
						<ul class="navbar-nav ">
							<li class="nav-item active">
								<Link href="/" className="nav-link">Home</Link>
							</li>
							<li class="nav-item">
								<Link href="/about" className="nav-link">About Us</Link>
							</li>
						</ul>
					</div>
					</div>
				</nav>
				<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
				<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
			</div>
		);
	}
}

export default Header;