import {NavLink} from 'react-router-dom'

export const NavBar = () => {
    return (
        <nav>
            <NavLink to='/'>Home</NavLink>
            <NavLink to='/about'>About</NavLink>
            <NavLink to='/Template/6adc03efb7668525bebe550f'>ReactFlow Template</NavLink>
            {/* <NavLink to='/Template/6adc5a4bb0d1297a02ea63fb'>ReactFlow Dev Template</NavLink> */}
            <NavLink to='/Template/6adc5c5ab0d1297a02ea63ff'>Mumbo Jumbo Dev</NavLink>
            <NavLink to='/Template/6ae0ff7721bb9de7eb13ed6b'>Mumbo Jumbo Dev Edit</NavLink>
            {/* <NavLink to='/Template/6adc60eab0d1297a02ea6400'>Mumbo Jumbo </NavLink> */}
        </nav>
    );
};