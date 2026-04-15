import { useKakaoPostcodePopup } from 'react-daum-postcode';

export interface AddressResult {
  zipCode: string;
  address: string;
}

export const useDaumPost = () => {
  const open = useKakaoPostcodePopup();

  const search = (onComplete: (result: AddressResult) => void) => {
    open({
      onComplete: (data) => {
        onComplete({ zipCode: data.zonecode, address: data.roadAddress });
      },
    });
  };

  return search;
};
