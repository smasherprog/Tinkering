using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace WebApplication3
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute("SPARoute",
               "spa/{*rest}",
               new { controller = "spa", action = "index" }
           );
            routes.MapRoute(
                "Default", // Route name
                "{controller}/", // URL with parameters
                new { controller = "spa", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );
        }
    }
}
