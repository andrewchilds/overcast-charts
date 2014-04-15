# Overcast Charts

Visualize cloud health data using Overcast.

![Screenshot](http://i.imgur.com/mD2DKob.png)

## Deploying to DigitalOcean using Overcast

1. Install and configure [Overcast](https://github.com/andrewchilds/overcast) on your machine.
2. Download this repo and run the `recipes/deploy-to-digitalocean` script.

What this script does:

1. Creates a new cluster named "charts"
2. Spins up a new 512mb DigitalOcean droplet named "charts.001"
3. Full upgrade + install required packages (git, node, redis)
4. Change default SSH port, configure iptables to only expose ports used by SSH and Node
5. Creates a new user "appuser" which will run the application
6. Installs, configures, and starts up the application

The application uses basic authentication. The username is "overcast", a random password is generated and will appear towards the end of the deploy log. This is stored in `~/overcast-charts/app/config/production.json`.

Once the script finishes you should be able to log in to http://[your assigned IP address]:3000/ and see data for your cloud start rolling in. By default it will update every 5 minutes. If any of your instances use something other than `.overcast/keys/overcast.key` to connect, you'll need to add that manually on the instance.

## Security

The deployment recipe takes a number of security measures:

- SSH password login is disabled, only keys are allowed.
- SSH port is changed.
- iptables is configured to only expose port 3000 and SSH.

However, since you're storing private keys to other servers on this machine, it's worth taking an extra step or two to make this machine more secure. Some recommendations, in order of paranoia:

1. Create a new SSH key on the Overcast Charts instance, and create a new user on all of the servers that your instance will connect to, and store/use only that key and that user to connect to your servers.

  ```sh
  # 1. Log in to the Overcast Charts instance as "appuser".

  # 2. Create a new SSH key on the instance:
  ssh-keygen -t rsa -N "" -f /home/appuser/.ssh/id_rsa

  # 3. Create a new user "overcast" on all of your servers:
  overcast run all add_user --env "username=overcast" --user root

  # 4. Push your new public key to the "overcast" user's authorized_keys:
  overcast push all /home/appuser/.ssh/id_rsa.pub /home/overcast/.ssh/authorized_keys --user overcast

  # 5. Configure Overcast to only use the "overcast" user and your new private key to connect.
  #    You can do this by manually editing .overcast/clusters.json, or by running these commands:
  sed -i "s/\"user\": \".*\"/\"user\": \"overcast\"/g" /home/appuser/.overcast/clusters.json
  sed -i "s/\"ssh_key\": \".*\"/\"ssh_key\": \"\/home\/appuser\/.ssh\/id_rsa\"/g" /home/appuser/.overcast/clusters.json

  # 6. Delete your pre-existing keys, now that you don't need them.
  rm $HOME/.overcast/keys/*

  # 7. Verify that you can connect to your servers using the new "overcast" user.
  overcast run all uptime
  ```

2. If your local network has a static IP and you don't care about viewing this data from other networks (or can VPN in), you can easily only allow incoming connections from your IP:
  ```sh
  # only allow access from your IP:
  overcast expose charts.01 3000 {YOUR_SSH_PORT} --whitelist "{YOUR_STATIC_IP}"
  # only allow app access from your IP, SSH access from anywhere:
  overcast expose charts.01 3000 {YOUR_SSH_PORT} --whitelist-3000 "{YOUR_STATIC_IP}"
  ```

3. If you're really paranoid, instead of deploying this to DigitalOcean, you could deploy to a local Ubuntu machine that is not reachable outside your local network. See the `recipes/deploy-to-existing-ubuntu` script for more.

## Running locally on OS X

From one terminal window, start Redis:

```sh
redis-server
```

From another terminal window, download the npm/bower package dependencies and start the application:

```sh
npm -g install grunt-cli bower
bower install
npm start
```

Development crontab:

```sh
# m     h     d     m     w     command
  */5   *     *     *     *     /usr/local/bin/node /path/to/overcast-charts/bin/snapshot >/path/to/overcast-charts/logs/snapshot 2>&1
  2     *     *     *     *     /usr/local/bin/node /path/to/overcast-charts/bin/weekly >/path/to/overcast-charts/logs/weekly 2>&1
  2     */4   *     *     *     /usr/local/bin/node /path/to/overcast-charts/bin/monthly >/path/to/overcast-charts/logs/monthly 2>&1
```

## License

MIT. Copyright &copy; 2014 [Andrew Childs](http://twitter.com/andrewchilds).
