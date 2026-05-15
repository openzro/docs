# Back Up Your Self-Hosted openZro Installation

Source: https://docs.netbird.io/selfhosted/maintenance/backup

---

# Back Up Your Self-Hosted openZro Installation

To back up your openZro installation, you need to copy the configuration files and the Management service databases.

The configuration files are located in the folder where you ran [the installation script](/selfhosted/selfhosted-quickstart#installation-script). To back up, copy the files to a backup location:
```bash
mkdir backup
cp docker-compose.yml dashboard.env config.yaml backup/
```

> **Note:** For detailed information about each configuration file and its options, see the [Configuration Files Reference](/selfhosted/configuration-files).

To save the server databases, stop the server and copy the files from the data directory:
```bash
docker compose stop openzro-server
docker compose cp -a openzro-server:/var/lib/openzro/ backup/
docker compose start openzro-server
```

## Older Setup (Separate Containers)

If your deployment uses the older setup with separate containers (`management`, `signal`, `relay`, `coturn`), back up the configuration files:
```bash
mkdir backup
cp docker-compose.yml Caddyfile dashboard.env management.json relay.env backup/
```

To save the Management service database:
```bash
docker compose stop management
docker compose cp -a management:/var/lib/openzro/ backup/
docker compose start management
```

## Get In Touch

Feel free to ping us on [Slack](/slack-url) if you have any questions.

- openZro managed version: [https://your-management.example.com](https://your-management.example.com)
- Make sure to [star us on GitHub](https://github.com/openzro/openzro)
- Follow us [on X](https://x.com/openzro)