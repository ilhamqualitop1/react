import styled from 'styled-components';
import { Outlet, NavLink } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa'; // ✅ Changed icon

export default function DashboardLayout() {
  return (
    <Container>
      <Sidebar>
        <Logo></Logo>
        <Nav>
          <StyledNavLink to="/dashboard/users">
            <FaUsers /> 
            <span>Utilisateurs</span>
          </StyledNavLink>
        </Nav>
      </Sidebar>
      <Main>
        <Header>
          <Title>Tableau de bord</Title>
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Main>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
`;

const Sidebar = styled.aside`
  width: 240px;
  background-color: #2d3748;
  color: #fff;
  padding: 20px;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  color: #fff;
  font-size: 16px;

  &.active {
    background-color: #4a5568;
  }

  &:hover {
    background-color: #4a5568;
  }

  svg {
    font-size: 18px;
  }

  span {
    font-size: 16px;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f7fafc;
`;

const Header = styled.header`
  height: 60px;
  background-color: #edf2f7;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e2e8f0;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  margin: 0;
`;

const Content = styled.section`
  flex: 1;
  margin-top: 10px;
  padding: 40px;
  overflow-y: auto;
`;
