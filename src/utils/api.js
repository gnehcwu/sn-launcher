import getToken from '../utils/getToken';
import { getStoredMenu, setStoredMenu } from '../utils/storage';
import extractMenu from '../utils/extractMenu';

export async function fetchMenu() {
  try {
    const token = getToken();
    if (!token) return [];

    const endpoint = 'http://localhost:8080/api/now/ui/polaris/menu';
    const res = await fetch(endpoint, {
      headers: {
        'x-usertoken': token,
      },
      mode: 'cors',
      credentials: 'include',
    });
    const data = await res.json();
    return data.result[0]?.subItems;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function fetchAndStoreMenu() {
  const menuItems = await fetchMenu();
  const transformedMenu = extractMenu(menuItems);
  await setStoredMenu(transformedMenu);

  return transformedMenu;
}

export default async function getMenu(isFreshing = false) {
  if (isFreshing) {
    return await fetchAndStoreMenu();
  } else {
    const storedMenu = await getStoredMenu();
    if (storedMenu) {
      return storedMenu;
    } else {
      return await fetchAndStoreMenu();
    }
  }
}
