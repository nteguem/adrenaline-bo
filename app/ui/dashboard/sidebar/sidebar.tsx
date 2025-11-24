/* eslint-disable @typescript-eslint/no-unused-vars */
import MenuLink from "./menuLink/menuLink";
import styles from "./sidebar.module.css";
const menuItems = [
  {
    title: "Pages",
    list: [
      {
        title: "Dashboard",
        path: "/dashboard",
      },
      {
        title: "Adrénaline Tour",
        path: "/dashboard/tour",
      },
      {
        title: "Tirage au sort",
        path: "/dashboard/tirage",
      },
      {
        title: "Export emails",
        path: "/dashboard/export",
      },
      {
        title: "Paramètres",
        path: "/dashboard/parametres",
      },
    ],
  },
];

const Sidebar = async () => {
  return (
    <div className={styles.topContent}>
      <ul className={styles.list}>
        {menuItems.map((cat) => (
          <li key={cat.title}>
            {cat.list.map((item) => (
              <MenuLink title={item.title} key={item.title} path={item.path} />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
