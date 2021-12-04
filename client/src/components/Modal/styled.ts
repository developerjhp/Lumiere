import styled from 'styled-components';

/* 모달 기본 구성 요소 */
export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--modal-index);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.2);
`;

export const ModalWrap = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 80vw;
  padding: 1.4rem;
  background-color: #ffffff;
  border-radius: 0.5rem;

  @media screen and (min-width: 768px) {
    width: 50vw;
  }
`;

export const CloseBtn = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5rem 0.6rem;
  font-size: 1.5rem;
  &:hover {
    color: var(--color-red);
  }
`;

/* 모달 컨텐츠 박스 */
export const ContentWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  p {
    margin: 2rem 0;
    font-size: 1.2rem;
    font-weight: 700;
  }
`;

/* 모달 버튼 박스 */
export const ButtonBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PrimaryButton = styled.button`
  width: 100%;
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffffff;
  background-color: var(--color-black);
  border: none;
  border-radius: 0.3rem;
  &:hover,
  &:focus {
    box-shadow: inset 0 0 0.6rem 0.1rem rgba(0, 0, 0, 0.6);
  }

  a {
    display: block;
    width: 100%;
    height: 100%;
    padding: 1rem 0;
    color: #ffffff;
  }
`;

/* 로그인 안내 모달 요소 */
export const GuideImgBox = styled.div`
  display: flex;
  justify-content: center;
  width: 10rem;
  height: 10rem;
  background-color: #f4ddcb;
  border-radius: 50%;
  overflow: hidden;

  > img {
    height: 100%;
  }
`;
